'use client';

import { useState } from 'react';
import TicketTable from '@/components/tickets/TicketTable';
import TicketFilters from '@/components/tickets/TicketFilters';

// Mock data
const mockTickets = [
    {
        id: '1',
        ticketNumber: '8821',
        subject: 'GPS device offline for 3 hours',
        customerName: 'PT. Trans Logistics',
        customerPhone: '0812****1234',
        priority: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        source: 'Freshchat' as const,
        assignedTo: {
            name: 'Jay Won',
            initials: 'JW',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoS1f1jqiPLCv9wP1ZX5ODYa0ghkKGjzT0pHb0bhhH20OWJucjJF3IaQ3_s7kGdgzSrESvLELeRePVCXvRr6Yy6B44ot4XYOMJ8EMZqG-XCW3_LdyPn99i7jvXqfWcPrKLwpHBNINwHk8ii2yZhCVjb4ie45MSAzkKY1ThrKQqU6IW1IYNMpiJCMbLekMBKotxWueVnTbLJwOjHjthhnsBYumDmvRUF1jRAc8enpPdmTnLWmqaUL-YtKY7AbgW3bg6V9BjT3ZcykA',
        },
        createdAt: 'Dec 25, 13:45',
    },
    {
        id: '2',
        ticketNumber: '8820',
        subject: 'Invoice discrepancy for November',
        customerName: 'CV. Maju Bersama',
        customerPhone: '0821****5678',
        priority: 'MEDIUM' as const,
        status: 'PENDING_REVIEW' as const,
        source: 'WhatsApp' as const,
        assignedTo: {
            name: 'Himari',
            initials: 'HM',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN0rsqgI4Fv1zrp1NtwFDfMAtVMQ2Oy1GVDJOvJ6nCUCQ7jsiVV56xA7nbgCm5tdWoz7uRJrvKLjNMVQjnTMrOkljsYHrZQXhnMHQ5CdvP5axphgV6bpBS37A56yKKtC62X_dV8ExJ__FV1vSZxJHnm6MtQpfaAfapPm0coFGD-DUok5mewrK8Mmy6ABuxS5_YsFmQs1t22lop8_n8TY7Vk9QXC4c9Gu2AMIHn2KB-a37kNDLDGLObRehy6a9NVQSgv140p_nRAM8',
        },
        createdAt: 'Dec 25, 11:20',
    },
    {
        id: '3',
        ticketNumber: '8819',
        subject: 'Server authentication error 500',
        customerName: 'PT. Digital Solusi',
        customerPhone: '0815****9012',
        priority: 'HIGH' as const,
        status: 'WITH_IT' as const,
        source: 'Freshchat' as const,
        assignedTo: {
            name: 'Budi',
            initials: 'IT',
            role: 'IT',
        },
        createdAt: 'Dec 25, 10:30',
    },
    {
        id: '4',
        ticketNumber: '8818',
        subject: 'Request for fleet pricing quotation',
        customerName: 'Sarah Williams',
        customerPhone: '0856****3456',
        priority: 'LOW' as const,
        status: 'OPEN' as const,
        source: 'WhatsApp' as const,
        assignedTo: undefined,
        createdAt: 'Dec 25, 09:15',
    },
    {
        id: '5',
        ticketNumber: '8817',
        subject: 'Password reset request',
        customerName: 'Ahmad Fauzi',
        customerPhone: '0877****7890',
        priority: 'LOW' as const,
        status: 'CLOSED' as const,
        source: 'Freshchat' as const,
        assignedTo: {
            name: 'Himari',
            initials: 'HM',
        },
        createdAt: 'Dec 24, 16:30',
    },
];

export default function SeniorTicketsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">All Tickets</h1>
                    <p className="text-sm text-slate-500 mt-1">View and manage all support tickets</p>
                </div>
                <TicketFilters
                    showCreateButton={true}
                    onCreateClick={() => setShowCreateModal(true)}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-full p-1.5 shadow-soft w-fit">
                <button className="px-5 py-2 rounded-full bg-[#EB4C36] text-white font-bold text-sm transition-all">
                    All Tickets
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">17</span>
                </button>
                <button className="px-5 py-2 rounded-full text-slate-500 hover:bg-slate-100 font-semibold text-sm transition-all">
                    Pending Review
                    <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full text-xs">3</span>
                </button>
                <button className="px-5 py-2 rounded-full text-slate-500 hover:bg-slate-100 font-semibold text-sm transition-all">
                    With IT
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">2</span>
                </button>
                <button className="px-5 py-2 rounded-full text-slate-500 hover:bg-slate-100 font-semibold text-sm transition-all">
                    Closed
                    <span className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded-full text-xs">45</span>
                </button>
            </div>

            {/* Ticket Table */}
            <TicketTable
                tickets={mockTickets}
                showAssignedTo={true}
                showSource={true}
                onViewTicket={(id) => {
                    setSelectedTicket(id);
                    // Open detail modal
                }}
                onAssignTicket={(id) => {
                    setSelectedTicket(id);
                    setShowAssignModal(true);
                }}
            />

            {/* Create Ticket Modal (placeholder) */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Ticket</h2>
                        <p className="text-slate-500">Modal content will be implemented with database integration.</p>
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="mt-6 px-6 py-3 bg-[#EB4C36] text-white rounded-xl font-bold hover:bg-[#d13a25]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Assign Modal (placeholder) */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAssignModal(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Assign Ticket #{selectedTicket}</h2>
                        <p className="text-slate-500">Assignment UI will be implemented with database integration.</p>
                        <button
                            onClick={() => setShowAssignModal(false)}
                            className="mt-6 px-6 py-3 bg-[#EB4C36] text-white rounded-xl font-bold hover:bg-[#d13a25]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
