'use client';

import TicketTable from '@/components/tickets/TicketTable';
import TicketFilters from '@/components/tickets/TicketFilters';

// Mock data - Junior only sees their assigned tickets
const mockTickets = [
    {
        id: '1',
        ticketNumber: '8820',
        subject: 'Invoice discrepancy for November',
        customerName: 'CV. Maju Bersama',
        customerPhone: '0821****5678',
        priority: 'MEDIUM' as const,
        status: 'IN_PROGRESS' as const,
        source: 'WhatsApp' as const,
        assignedTo: {
            name: 'Himari',
            initials: 'HM',
        },
        createdAt: 'Dec 25, 11:20',
    },
    {
        id: '2',
        ticketNumber: '8818',
        subject: 'Password reset request',
        customerName: 'Ahmad Fauzi',
        customerPhone: '0877****7890',
        priority: 'LOW' as const,
        status: 'OPEN' as const,
        source: 'Freshchat' as const,
        assignedTo: {
            name: 'Himari',
            initials: 'HM',
        },
        createdAt: 'Dec 25, 09:15',
    },
    {
        id: '3',
        ticketNumber: '8815',
        subject: 'How to export report data',
        customerName: 'Sari Indah',
        customerPhone: '0898****4567',
        priority: 'LOW' as const,
        status: 'OPEN' as const,
        source: 'WhatsApp' as const,
        assignedTo: {
            name: 'Himari',
            initials: 'HM',
        },
        createdAt: 'Dec 24, 14:30',
    },
];

export default function JuniorTicketsPage() {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
                    <p className="text-sm text-slate-500 mt-1">Tickets assigned to you</p>
                </div>
                <TicketFilters
                    showCreateButton={false} // Junior can't create tickets
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-full p-1.5 shadow-soft w-fit">
                <button className="px-5 py-2 rounded-full bg-emerald-500 text-white font-bold text-sm transition-all">
                    Assigned to Me
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">3</span>
                </button>
                <button className="px-5 py-2 rounded-full text-slate-500 hover:bg-slate-100 font-semibold text-sm transition-all">
                    Completed
                    <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">28</span>
                </button>
            </div>

            {/* Ticket Table - Junior doesn't see "Assigned To" column */}
            <TicketTable
                tickets={mockTickets}
                showAssignedTo={false}
                showSource={true}
                onViewTicket={(id) => {
                    console.log('View ticket', id);
                }}
            />
        </>
    );
}
