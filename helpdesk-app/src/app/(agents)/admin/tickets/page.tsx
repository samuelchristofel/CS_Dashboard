'use client';

import TicketTable from '@/components/tickets/TicketTable';
import TicketFilters from '@/components/tickets/TicketFilters';

// Mock data - Admin sees all tickets with full details
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
    {
        id: '6',
        ticketNumber: '8816',
        subject: 'Vehicle not moving on map display',
        customerName: 'PT. Logistik Nusantara',
        customerPhone: '0812****5678',
        priority: 'HIGH' as const,
        status: 'CLOSED' as const,
        source: 'WhatsApp' as const,
        assignedTo: {
            name: 'Jay Won',
            initials: 'JW',
        },
        createdAt: 'Dec 24, 14:30',
    },
];

export default function AdminTicketsPage() {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">All Tickets</h1>
                    <p className="text-sm text-slate-500 mt-1">View and manage all system tickets</p>
                </div>
                <TicketFilters
                    showCreateButton={true}
                />
            </div>

            {/* Stats Row */}
            <div className="flex gap-4">
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-soft">
                    <p className="text-3xl font-extrabold text-slate-900">156</p>
                    <p className="text-xs text-slate-500 mt-1">Total Open</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-soft">
                    <p className="text-3xl font-extrabold text-red-500">12</p>
                    <p className="text-xs text-slate-500 mt-1">High Priority</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-soft">
                    <p className="text-3xl font-extrabold text-amber-500">23</p>
                    <p className="text-xs text-slate-500 mt-1">Pending Review</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-soft">
                    <p className="text-3xl font-extrabold text-blue-500">8</p>
                    <p className="text-xs text-slate-500 mt-1">With IT</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-soft">
                    <p className="text-3xl font-extrabold text-green-500">1,089</p>
                    <p className="text-xs text-slate-500 mt-1">Closed</p>
                </div>
            </div>

            {/* Ticket Table */}
            <TicketTable
                tickets={mockTickets}
                showAssignedTo={true}
                showSource={true}
                onViewTicket={(id) => {
                    console.log('View ticket', id);
                }}
                onAssignTicket={(id) => {
                    console.log('Assign ticket', id);
                }}
            />
        </>
    );
}
