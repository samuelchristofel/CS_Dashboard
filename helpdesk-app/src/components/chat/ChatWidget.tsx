'use client';

import { useState } from 'react';
import type { UserRole } from '@/types';

interface Contact {
    id: string;
    name: string;
    role: string;
    roleCategory: string;
    avatar?: string;
    isOnline: boolean;
    unreadCount?: number;
}

interface ChatWidgetProps {
    currentUserRole: UserRole;
}

const roleGradients: Record<UserRole, string> = {
    senior: 'from-[#EB4C36] to-[#d13a25]',
    junior: 'from-emerald-500 to-green-600',
    it: 'from-blue-500 to-blue-700',
    admin: 'from-slate-800 to-slate-900',
};

const buttonColors: Record<UserRole, string> = {
    senior: 'bg-[#EB4C36] hover:bg-[#d13a25] shadow-[#EB4C36]/30',
    junior: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30',
    it: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30',
    admin: 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/30',
};

// Mock contacts
const mockContacts: Contact[] = [
    { id: '1', name: 'Jay Won', role: 'Senior CS', roleCategory: 'Senior CS', isOnline: true, unreadCount: 1 },
    { id: '2', name: 'Himari', role: 'Junior CS', roleCategory: 'Junior CS', isOnline: true },
    { id: '3', name: 'Andi R.', role: 'Junior CS', roleCategory: 'Junior CS', isOnline: false },
    { id: '4', name: 'Budi Santoso', role: 'IT Support', roleCategory: 'IT Support', isOnline: true, unreadCount: 1 },
    { id: '5', name: 'Admin', role: 'Super Admin', roleCategory: 'Admin', isOnline: false },
];

export default function ChatWidget({ currentUserRole }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const gradient = roleGradients[currentUserRole];
    const buttonColor = buttonColors[currentUserRole];

    const groupedContacts = mockContacts.reduce((acc, contact) => {
        if (!acc[contact.roleCategory]) {
            acc[contact.roleCategory] = [];
        }
        acc[contact.roleCategory].push(contact);
        return acc;
    }, {} as Record<string, Contact[]>);

    const totalUnread = mockContacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Button */}
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

            {/* Chat Panel */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${gradient} text-white p-4`}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">Messages</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="size-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <p className="text-sm opacity-80 mt-1">Team Communication</p>
                    </div>

                    {/* Contacts List */}
                    {!selectedContact && (
                        <div className="max-h-96 overflow-y-auto">
                            {Object.entries(groupedContacts).map(([category, contacts]) => (
                                <div key={category}>
                                    <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {category}
                                    </div>
                                    {contacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            onClick={() => setSelectedContact(contact)}
                                            className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                                        >
                                            <div className="relative">
                                                {contact.avatar ? (
                                                    <div
                                                        className="size-10 rounded-full bg-cover bg-center"
                                                        style={{ backgroundImage: `url('${contact.avatar}')` }}
                                                    />
                                                ) : (
                                                    <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                                                        {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                )}
                                                <span
                                                    className={`absolute bottom-0 right-0 size-3 ${contact.isOnline ? 'bg-green-500' : 'bg-slate-300'
                                                        } border-2 border-white rounded-full`}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {contact.isOnline ? 'Online' : 'Offline'}
                                                </p>
                                            </div>
                                            {contact.unreadCount && (
                                                <span className="size-5 bg-[#EB4C36] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                    {contact.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Chat Conversation */}
                    {selectedContact && (
                        <div className="flex flex-col h-96">
                            {/* Chat Header */}
                            <div className="p-3 border-b border-slate-100 flex items-center gap-3">
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
                            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                                <div className="flex gap-2">
                                    <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] flex-shrink-0">
                                        {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%]">
                                        <p className="text-sm text-slate-700">Hey, how can I help you?</p>
                                        <p className="text-[10px] text-slate-400 mt-1">10:30 AM</p>
                                    </div>
                                </div>
                            </div>

                            {/* Input */}
                            <div className="p-3 border-t border-slate-100 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-slate-100 rounded-full border-none text-sm focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none"
                                />
                                <button className={`size-10 rounded-full ${buttonColor} text-white flex items-center justify-center`}>
                                    <span className="material-symbols-outlined text-lg">send</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
