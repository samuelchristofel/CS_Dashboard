'use client';

import TicketTable from '@/components/tickets/TicketTable';
import TicketFilters from '@/components/tickets/TicketFilters';

// Mock data - IT only sees escalated technical tickets
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
            name: 'Budi',
            initials: 'IT',
            role: 'IT',
        },
        createdAt: 'Dec 25, 14:00',
    },
    {
        id: '2',
        ticketNumber: '8817',
        subject: 'Server authentication error 500',
        customerName: 'PT. Digital Solusi',
        customerPhone: '0815****9012',
        priority: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        source: 'Freshchat' as const,
        assignedTo: {
            name: 'Budi',
            initials: 'IT',
            role: 'IT',
        },
        createdAt: 'Dec 25, 10:30',
    },
    {
        id: '3',
        ticketNumber: '8819',
        subject: 'Mobile App Login Failed',
        customerName: 'Ryan Kim',
        priority: 'HIGH' as const,
        status: 'RESOLVED' as const,
        source: 'Freshchat' as const,
        assignedTo: {
            name: 'Budi',
            initials: 'IT',
            role: 'IT',
        },
        createdAt: 'Dec 25, 09:00',
    },
];

export default function ITTicketsPage() {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Technical Tickets</h1>
                    <p className="text-sm text-slate-500 mt-1">Escalated technical issues assigned to IT</p>
                </div>
                <TicketFilters
                    showCreateButton={false}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-full p-1.5 shadow-soft w-fit">
                <button className="px-5 py-2 rounded-full bg-blue-500 text-white font-bold text-sm transition-all">
                    Assigned to Me
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">2</span>
                </button>
                <button className="px-5 py-2 rounded-full text-slate-500 hover:bg-slate-100 font-semibold text-sm transition-all">
                    Pending CS Review
                    <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">1</span>
                </button>
                <button className="px-5 py-2 rounded-full text-slate-500 hover:bg-slate-100 font-semibold text-sm transition-all">
                    All Technical
                    <span className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded-full text-xs">8</span>
                </button>
            </div>

            {/* Ticket Table */}
            <TicketTable
                tickets={mockTickets}
                showAssignedTo={false}
                showSource={false}
                onViewTicket={(id) => {
                    console.log('View ticket', id);
                }}
            />
        </>
    );
}
