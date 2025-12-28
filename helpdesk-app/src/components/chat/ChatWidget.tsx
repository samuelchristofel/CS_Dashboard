'use client';

import { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/lib/supabase';
import type { UserRole } from '@/types';

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
    roleCategory: string; // Helper for grouping
}

const roleGradients: Record<UserRole | string, string> = {
    senior: 'from-[#EB4C36] to-[#d13a25]',
    junior: 'from-emerald-500 to-green-600',
    it: 'from-blue-500 to-blue-700',
    admin: 'from-slate-800 to-slate-900',
    default: 'from-slate-500 to-slate-700'
};

const buttonColors: Record<UserRole | string, string> = {
    senior: 'bg-[#EB4C36] hover:bg-[#d13a25] shadow-[#EB4C36]/30',
    junior: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30',
    it: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30',
    admin: 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/30',
    default: 'bg-slate-500'
};

const getRoleCategory = (role: string): string => {
    switch (role) {
        case 'senior': return 'Senior CS';
        case 'junior': return 'Junior CS';
        case 'it': return 'IT Support';
        case 'admin': return 'Admin';
        default: return 'Others';
    }
};

export default function ChatWidget({ currentUser }: ChatWidgetProps) {
    // UI State
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    // Data State
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initial Mount
    useEffect(() => {
        setIsMounted(true);
        audioRef.current = new Audio('/sounds/notification.mp3'); // Optional: Add sound file later
    }, []);

    // Fetch Contacts (Users) with unread counts and last messages
    useEffect(() => {
        const fetchContacts = async () => {
            if (!currentUser) return;

            // 1. Fetch all users except self
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .neq('id', currentUser.id)
                .order('name');

            if (error) {
                console.error('Error fetching contacts:', error);
                return;
            }

            // 2. Get my conversation IDs
            const { data: myConvos } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', currentUser.id);

            const myConvoIds = myConvos?.map(c => c.conversation_id) || [];

            // 3. Get all participants in my conversations
            const { data: allParticipants } = await supabase
                .from('conversation_participants')
                .select('conversation_id, user_id')
                .in('conversation_id', myConvoIds);

            // 4. Get last message for each conversation
            const { data: allMessages } = await supabase
                .from('messages')
                .select('*')
                .in('conversation_id', myConvoIds)
                .order('created_at', { ascending: false });

            // Build a map of contact_id -> conversation data
            const contactDataMap = new Map<string, { unreadCount: number; lastMessage?: string; lastMessageTime?: string }>();

            if (allParticipants && allMessages) {
                for (const user of users) {
                    // Find shared conversation with this user
                    let sharedConvoId: string | null = null;
                    for (const convoId of myConvoIds) {
                        const participantIds = allParticipants
                            .filter(p => p.conversation_id === convoId)
                            .map(p => p.user_id);
                        if (participantIds.includes(currentUser.id) && participantIds.includes(user.id)) {
                            sharedConvoId = convoId;
                            break;
                        }
                    }

                    if (sharedConvoId) {
                        // Get messages for this conversation
                        const convoMessages = allMessages.filter(m => m.conversation_id === sharedConvoId);
                        const lastMsg = convoMessages[0]; // Already sorted descending

                        // Count unread (messages from this user that I haven't read)
                        // For now, count messages from them that are newer than last time I sent
                        const myLastMsg = convoMessages.find(m => m.sender_id === currentUser.id);
                        const unreadCount = convoMessages.filter(m =>
                            m.sender_id === user.id &&
                            (!myLastMsg || new Date(m.created_at) > new Date(myLastMsg.created_at))
                        ).length;

                        contactDataMap.set(user.id, {
                            unreadCount,
                            lastMessage: lastMsg?.content,
                            lastMessageTime: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
                        });
                    }
                }
            }

            // Transform to Contact type
            const formattedContacts: Contact[] = users.map(u => {
                const data = contactDataMap.get(u.id);
                return {
                    ...u,
                    roleCategory: getRoleCategory(u.role),
                    isOnline: false,
                    unreadCount: data?.unreadCount || 0,
                    lastMessage: data?.lastMessage,
                    lastMessageTime: data?.lastMessageTime
                };
            });

            // Sort: contacts with messages first, then by unread count
            formattedContacts.sort((a, b) => {
                if (a.lastMessage && !b.lastMessage) return -1;
                if (!a.lastMessage && b.lastMessage) return 1;
                return b.unreadCount - a.unreadCount;
            });

            setContacts(formattedContacts);
        };

        fetchContacts();
    }, [currentUser]);

    // Handle Conversation Selection + Refresh on chat open
    useEffect(() => {
        const loadConversation = async () => {
            if (!currentUser || !selectedContact) return;

            console.log('🔍 Loading conversation for:', {
                currentUser: currentUser.name,
                selectedContact: selectedContact.name
            });

            // 1. Find existing conversation with this user
            // STEP A: Get all my conversations
            const { data: myConvos, error: myConvosError } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', currentUser.id);

            console.log('📋 My conversations:', { myConvos, error: myConvosError });

            if (!myConvos || myConvos.length === 0) {
                console.log('⚠️ No conversations found for current user');
                setActiveConversationId(null);
                setMessages([]);
                return;
            }

            const myConvoIds = myConvos.map(c => c.conversation_id);
            console.log('🔑 My conversation IDs:', myConvoIds);

            // STEP B: Check if selected contact is in any of these conversations
            // IMPROVED: Get all participants in my conversations
            const { data: allParticipants, error: participantsError } = await supabase
                .from('conversation_participants')
                .select('conversation_id, user_id')
                .in('conversation_id', myConvoIds);

            console.log('👥 All participants:', { allParticipants, error: participantsError });

            // Find conversation where BOTH me and selected contact are participants
            let sharedConvoId = null;
            if (allParticipants) {
                for (const convoId of myConvoIds) {
                    const participantIds = allParticipants
                        .filter(p => p.conversation_id === convoId)
                        .map(p => p.user_id);

                    if (participantIds.includes(currentUser.id) && participantIds.includes(selectedContact.id)) {
                        sharedConvoId = convoId;
                        break;
                    }
                }
            }

            console.log('🤝 Shared conversation:', sharedConvoId);

            if (sharedConvoId) {
                setActiveConversationId(sharedConvoId);
                console.log('✅ Found existing conversation:', sharedConvoId);

                // Load messages
                const { data: msgs, error: msgsError } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', sharedConvoId)
                    .order('created_at', { ascending: true });

                console.log('💬 Messages loaded:', { count: msgs?.length, error: msgsError, messages: msgs });
                setMessages(msgs || []);
            } else {
                console.log('❌ No common conversation found - will create on first message');
                setActiveConversationId(null); // Will create on first message
                setMessages([]);
            }
        };

        loadConversation();
    }, [currentUser?.id, selectedContact?.id]); // Use stable IDs to prevent size changes

    // Presence Subscription
    useEffect(() => {
        if (!currentUser) return;

        const channel = supabase.channel('global_presence', {
            config: {
                presence: {
                    key: currentUser.id,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();

                setContacts((prevContacts) =>
                    prevContacts.map((contact) => ({
                        ...contact,
                        isOnline: !!newState[contact.id]
                    }))
                );
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: currentUser.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser]);

    // Real-time Subscription (Messages) - ALWAYS ACTIVE
    useEffect(() => {
        if (!currentUser) return;

        const channel = supabase
            .channel('chat_updates_' + currentUser.id)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMsg = payload.new as Message;
                    console.log('📨 New message received:', newMsg);

                    // If it belongs to active conversation, append it immediately
                    if (activeConversationId && newMsg.conversation_id === activeConversationId) {
                        setMessages((prev) => {
                            // Avoid duplicates
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                        // Scroll to bottom
                        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

                        // Play sound if chat is open
                        if (isOpen) {
                            audioRef.current?.play().catch(e => console.log('Audio play failed', e));
                        }
                    }
                    // Note: For other conversations, we could update unread counts here
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser?.id, activeConversationId]); // Use stable ID

    // Send Message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser || !selectedContact) return;

        setIsSending(true);
        let conversationId = activeConversationId;

        try {
            // If no conversation exists, create one
            if (!conversationId) {
                // 1. Create conversation
                const { data: conv, error: convError } = await supabase
                    .from('conversations')
                    .insert({ type: 'direct' })
                    .select()
                    .single();

                if (convError) throw convError;
                conversationId = conv.id;

                // 2. Add participants (Me and Them)
                const { error: partError } = await supabase
                    .from('conversation_participants')
                    .insert([
                        { conversation_id: conversationId, user_id: currentUser.id },
                        { conversation_id: conversationId, user_id: selectedContact.id }
                    ]);

                if (partError) throw partError;

                setActiveConversationId(conversationId);
            }

            // Send message
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: currentUser.id,
                    content: newMessage.trim(),
                    type: 'text'
                });

            if (msgError) throw msgError;

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    // Derived State
    const gradient = currentUser ? roleGradients[currentUser.role] : roleGradients.default;
    const buttonColor = currentUser ? buttonColors[currentUser.role] : buttonColors.default;

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All' || contact.roleCategory.includes(roleFilter);
        return matchesSearch && matchesRole;
    });

    const groupedContacts = filteredContacts.reduce((acc, contact) => {
        if (!acc[contact.roleCategory]) {
            acc[contact.roleCategory] = [];
        }
        acc[contact.roleCategory].push(contact);
        return acc;
    }, {} as Record<string, Contact[]>);

    const totalUnread = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    if (!isMounted || !currentUser) return null;

    return (
        <>
            {/* Toggle Button - Fixed Bottom Right */}
            <div className="fixed bottom-6 right-6 z-[60]">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`size-14 rounded-full ${buttonColor} text-white shadow-lg flex items-center justify-center transition-all hover:scale-105`}
                >
                    <span className="material-symbols-outlined text-2xl">
                        {isOpen ? 'close' : 'chat'}
                    </span>
                </button>

                {/* Notification Badge */}
                {totalUnread > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 size-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {totalUnread}
                    </span>
                )}
            </div>

            {/* Draggable Chat Window */}
            {isOpen && (
                <Rnd
                    default={{
                        x: typeof window !== 'undefined' ? window.innerWidth - 470 : 0,
                        y: typeof window !== 'undefined' ? window.innerHeight - 700 : 0,
                        width: 420,
                        height: 600
                    }}
                    minWidth={350}
                    minHeight={500}
                    dragHandleClassName="chat-drag-handle"
                    bounds="window"
                    style={{ zIndex: 50 }}
                >
                    <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                        {/* Header */}
                        <div className={`chat-drag-handle bg-gradient-to-r ${gradient} text-white p-5 cursor-move`}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-xl">Messages</h3>
                                    <p className="text-sm opacity-90">Team Communication</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="size-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>

                            {/* Search & Filter - Only show locally in contact list view */}
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
                                        {['All', 'Senior', 'Junior', 'IT', 'Admin'].map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => setRoleFilter(role)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${roleFilter === role
                                                    ? 'bg-white text-slate-800 shadow-sm'
                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                                    }`}
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
                                {Object.entries(groupedContacts).map(([category, contacts]) => (
                                    <div key={category}>
                                        <div className="px-4 py-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{category}</p>
                                        </div>
                                        <div className="space-y-1">
                                            {contacts.map((contact) => (
                                                <div
                                                    key={contact.id}
                                                    onClick={() => {
                                                        // Clear unread count for this contact
                                                        setContacts(prev => prev.map(c =>
                                                            c.id === contact.id ? { ...c, unreadCount: 0 } : c
                                                        ));
                                                        setSelectedContact(contact);
                                                    }}
                                                    className="p-3 mx-1 rounded-2xl flex items-center gap-3 hover:bg-slate-100 cursor-pointer transition-all group"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        {contact.avatar ? (
                                                            <div
                                                                className="size-11 rounded-full bg-cover bg-center ring-2 ring-white shadow-sm"
                                                                style={{ backgroundImage: `url('${contact.avatar}')` }}
                                                            />
                                                        ) : (
                                                            <div className="size-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm ring-2 ring-white shadow-sm group-hover:bg-white group-hover:shadow-md transition-all">
                                                                {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                            </div>
                                                        )}
                                                        <span
                                                            className={`absolute bottom-0 right-0 size-3 ${contact.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                                                } border-[2px] border-white rounded-full`}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <p className="text-sm font-bold text-slate-800 truncate group-hover:text-slate-900 transition-colors">{contact.name}</p>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                {contact.lastMessageTime && (
                                                                    <span className="text-[10px] text-slate-400 font-medium">{contact.lastMessageTime}</span>
                                                                )}
                                                                {contact.unreadCount > 0 && (
                                                                    <span className="min-w-[18px] h-[18px] bg-[#EB4C36] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm shadow-red-500/30">
                                                                        {contact.unreadCount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {contact.lastMessage ? (
                                                                <p className="text-xs text-slate-500 font-medium truncate group-hover:text-slate-600 flex-1">
                                                                    {contact.lastMessage.length > 30 ? contact.lastMessage.substring(0, 30) + '...' : contact.lastMessage}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-slate-400 italic flex-1">No messages yet</p>
                                                            )}
                                                            {contact.isOnline && (
                                                                <span className="text-[10px] text-emerald-600 font-medium px-1.5 py-0.5 bg-emerald-50 rounded-full">
                                                                    Online
                                                                </span>
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
                                    <button
                                        onClick={() => setSelectedContact(null)}
                                        className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                                    >
                                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    </button>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">{selectedContact.name}</p>
                                        <p className="text-[10px] text-slate-400">{selectedContact.role}</p>
                                    </div>
                                    <span
                                        className={`size-2 ${selectedContact.isOnline ? 'bg-green-500' : 'bg-slate-300'} rounded-full`}
                                    />
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
                                            const isMe = msg.sender_id === currentUser.id;
                                            return (
                                                <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                    <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] flex-shrink-0">
                                                        {isMe ? currentUser.name.charAt(0) : selectedContact.name.charAt(0)}
                                                    </div>
                                                    <div className={`p-3 rounded-2xl shadow-sm max-w-[80%] ${isMe
                                                        ? `${buttonColor} text-white rounded-tr-none shadow-orange-500/20`
                                                        : 'bg-white text-slate-700 rounded-tl-none'
                                                        }`}>
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                                    <div className="bg-slate-100 rounded-[1.5rem] p-1 flex items-end gap-2 transition-all focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-200 focus-within:shadow-sm border border-transparent">
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
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            className="flex-1 bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 focus:ring-0 focus:outline-none px-2 py-2.5 max-h-32 resize-none leading-5"
                                            style={{ minHeight: '40px' }}
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
