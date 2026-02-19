"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import type { UserRole } from "@/types";

// Types
interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface ChatWidgetProps {
  currentUser: UserData | null;
}

interface Contact extends UserData {
  isOnline: boolean;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  lastSeen?: string;
  roleCategory: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file";
  createdAt: string;
  sender?: UserData;
}

const roleGradients: Record<UserRole | string, string> = {
  senior: "from-[#EB4C36] to-[#d13a25]",
  junior: "from-emerald-500 to-green-600",
  it: "from-blue-500 to-blue-700",
  admin: "from-slate-800 to-slate-900",
  default: "from-slate-500 to-slate-700",
};

const buttonColors: Record<UserRole | string, string> = {
  senior: "bg-[#EB4C36] hover:bg-[#d13a25] shadow-[#EB4C36]/30",
  junior: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30",
  it: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30",
  admin: "bg-slate-800 hover:bg-slate-900 shadow-slate-800/30",
  default: "bg-slate-500",
};

const getRoleCategory = (role: string): string => {
  switch (role) {
    case "senior":
      return "Senior CS";
    case "junior":
      return "Junior CS";
    case "it":
      return "IT Support";
    case "admin":
      return "Admin";
    default:
      return "Others";
  }
};

export default function ChatWidget({ currentUser }: ChatWidgetProps) {
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Data State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initial Mount
  useEffect(() => {
    setIsMounted(true);
    audioRef.current = new Audio("/sounds/notification.mp3");
  }, []);

  // Fetch Contacts via API
  const fetchContacts = useCallback(async () => {
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/chat/users?exclude_id=${currentUser.id}`);
      const data = await res.json();

      if (data.users) {
        const formattedContacts: Contact[] = data.users.map((u: UserData) => ({
          ...u,
          roleCategory: getRoleCategory(u.role),
          isOnline: false, // No real-time presence without Supabase
          unreadCount: 0,
          lastMessage: undefined,
          lastMessageTime: undefined,
        }));

        // Sort by name
        formattedContacts.sort((a, b) => a.name.localeCompare(b.name));
        setContacts(formattedContacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Fetch or Create Conversation when selecting a contact
  useEffect(() => {
    const loadConversation = async () => {
      if (!currentUser || !selectedContact) return;

      try {
        // Try to create/get existing conversation
        const res = await fetch("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUser.id,
            participant_ids: [selectedContact.id],
            type: "direct",
          }),
        });

        const data = await res.json();
        if (data.conversation) {
          setActiveConversationId(data.conversation.id);
          // Load messages
          await fetchMessages(data.conversation.id);
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
      }
    };

    loadConversation();
  }, [currentUser, selectedContact]);

  // Fetch Messages
  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?conversation_id=${conversationId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        // Scroll to bottom
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Poll for new messages every 3 seconds when chat is open
  useEffect(() => {
    if (!activeConversationId || !isOpen) return;

    const interval = setInterval(() => {
      fetchMessages(activeConversationId);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeConversationId, isOpen]);

  // Send Message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedContact) return;

    setIsSending(true);

    try {
      let conversationId = activeConversationId;

      // If no conversation exists, create one
      if (!conversationId) {
        const convRes = await fetch("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUser.id,
            participant_ids: [selectedContact.id],
            type: "direct",
          }),
        });
        const convData = await convRes.json();
        conversationId = convData.conversation.id;
        setActiveConversationId(conversationId);
      }

      // Send message
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: newMessage.trim(),
          type: "text",
        }),
      });

      if (res.ok) {
        setNewMessage("");
        // Refresh messages
        if (conversationId) {
          await fetchMessages(conversationId);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Derived State
  const gradient = currentUser ? roleGradients[currentUser.role] : roleGradients.default;
  const buttonColor = currentUser ? buttonColors[currentUser.role] : buttonColors.default;

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || contact.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || contact.roleCategory.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const groupedContacts = filteredContacts.reduce(
    (acc, contact) => {
      if (!acc[contact.roleCategory]) {
        acc[contact.roleCategory] = [];
      }
      acc[contact.roleCategory].push(contact);
      return acc;
    },
    {} as Record<string, Contact[]>,
  );

  const totalUnread = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  if (!isMounted || !currentUser) return null;

  return (
    <>
      {/* Toggle Button - Fixed Bottom Right */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <button onClick={() => setIsOpen(!isOpen)} className={`size-14 rounded-full ${buttonColor} text-white shadow-lg flex items-center justify-center transition-all hover:scale-105`}>
          <span className="material-symbols-outlined text-2xl">{isOpen ? "close" : "chat"}</span>
        </button>

        {/* Notification Badge */}
        {totalUnread > 0 && !isOpen && <span className="absolute -top-1 -right-1 size-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{totalUnread}</span>}
      </div>

      {/* Draggable Chat Window */}
      {isOpen && (
        <Rnd
          default={{
            x: typeof window !== "undefined" ? window.innerWidth - 470 : 0,
            y: typeof window !== "undefined" ? window.innerHeight - 700 : 0,
            width: 420,
            height: 600,
          }}
          minWidth={350}
          minHeight={500}
          dragHandleClassName="chat-drag-handle"
          bounds="window"
          style={{ zIndex: 50 }}
        >
          <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            {/* Header */}
            <div className={`chat-drag-handle bg-gradient-to-r ${gradient} text-white p-5 cursor-move`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-xl">Messages</h3>
                  <p className="text-sm opacity-90">Team Communication</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="size-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer" onMouseDown={(e) => e.stopPropagation()}>
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Search & Filter - Only show in contact list view */}
              {!selectedContact && (
                <div className="space-y-3 cursor-default" onMouseDown={(e) => e.stopPropagation()}>
                  {/* Search Bar */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-lg">search</span>
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white/20 border-none rounded-xl text-sm text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/40 focus:bg-white/30 transition-all font-medium"
                    />
                  </div>

                  {/* Role Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {["All", "Senior", "Junior", "IT", "Admin"].map((role) => (
                      <button
                        key={role}
                        onClick={() => setRoleFilter(role)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${roleFilter === role ? "bg-white text-slate-800 shadow-sm" : "bg-white/10 text-white hover:bg-white/20"}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contacts List */}
            {!selectedContact && (
              <div className="flex-1 overflow-y-auto bg-white min-h-0 p-2 space-y-2">
                {Object.entries(groupedContacts).map(([category, categoryContacts]) => (
                  <div key={category}>
                    <div className="px-4 py-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{category}</p>
                    </div>
                    <div className="space-y-1">
                      {categoryContacts.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => {
                            setContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...c, unreadCount: 0 } : c)));
                            setSelectedContact(contact);
                          }}
                          className="p-3 mx-1 rounded-lg flex items-center gap-3 hover:bg-slate-100 cursor-pointer transition-all group"
                        >
                          <div className="relative flex-shrink-0">
                            {contact.avatar ? (
                              <div className="size-11 rounded-full bg-cover bg-center ring-2 ring-white shadow-sm" style={{ backgroundImage: `url('${contact.avatar}')` }} />
                            ) : (
                              <div className="size-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm ring-2 ring-white shadow-sm group-hover:bg-white group-hover:shadow-md transition-all">
                                {contact.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                            )}
                            <span className={`absolute bottom-0 right-0 size-3 ${contact.isOnline ? "bg-emerald-500" : "bg-slate-300"} border-[2px] border-white rounded-full`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className="text-sm font-bold text-slate-800 truncate group-hover:text-slate-900 transition-colors">{contact.name}</p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {contact.lastMessageTime && <span className="text-[10px] text-slate-400 font-medium">{contact.lastMessageTime}</span>}
                                {contact.unreadCount > 0 && (
                                  <span className="min-w-[18px] h-[18px] bg-[#EB4C36] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm shadow-red-500/30">{contact.unreadCount}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {contact.lastMessage ? (
                                <p className="text-xs text-slate-500 font-medium truncate group-hover:text-slate-600 flex-1">{contact.lastMessage.length > 30 ? contact.lastMessage.substring(0, 30) + "..." : contact.lastMessage}</p>
                              ) : (
                                <p className="text-xs text-slate-400 italic flex-1">No messages yet</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredContacts.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                    <span className="material-symbols-outlined text-4xl opacity-50">search_off</span>
                    <p className="text-sm font-medium">No contacts found</p>
                  </div>
                )}
              </div>
            )}

            {/* Chat Conversation */}
            {selectedContact && (
              <div className="flex flex-col flex-1 min-h-0">
                {/* Chat Header */}
                <div className="p-3 border-b border-slate-100 flex items-center gap-3 shrink-0">
                  <button onClick={() => setSelectedContact(null)} className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{selectedContact.name}</p>
                    <p className="text-[10px] text-slate-400">{selectedContact.role}</p>
                  </div>
                  <span className={`size-2 ${selectedContact.isOnline ? "bg-green-500" : "bg-slate-300"} rounded-full`} />
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 min-h-0">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <p className="text-sm">No messages yet.</p>
                      <p className="text-xs">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                          <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] flex-shrink-0">{isMe ? currentUser.name.charAt(0) : selectedContact.name.charAt(0)}</div>
                          <div className={`p-3 rounded-lg shadow-sm max-w-[80%] ${isMe ? `${buttonColor} text-white rounded-tr-none shadow-orange-500/20` : "bg-white text-slate-700 rounded-tl-none"}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? "text-white/70" : "text-slate-400"}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                  <div className="bg-slate-100 rounded-lg p-1 flex items-end gap-2 transition-all focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-200 focus-within:shadow-sm border border-transparent">
                    <div className="flex items-center gap-1 pl-1 mb-1">
                      <button className="size-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                      </button>
                      <button className="size-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-[20px]">attach_file</span>
                      </button>
                    </div>
                    <textarea
                      placeholder="Type a message..."
                      rows={1}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 focus:ring-0 focus:outline-none px-2 py-2.5 max-h-32 resize-none leading-5"
                      style={{ minHeight: "40px" }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || !newMessage.trim()}
                      className={`size-10 rounded-full ${buttonColor} text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Rnd>
      )}
    </>
  );
}
