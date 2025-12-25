'use client';

import type { Priority, TicketStatus } from '@/types';

interface TicketRow {
    id: string;
    ticketNumber: string;
    subject: string;
    customerName: string;
    customerPhone?: string;
    priority: Priority;
    status: TicketStatus;
    source: 'Freshchat' | 'WhatsApp' | 'Email' | 'Phone';
    assignedTo?: {
        name: string;
        avatar?: string;
        initials: string;
        role?: string;
    };
    createdAt: string;
    onView?: () => void;
    onAssign?: () => void;
}

interface TicketTableProps {
    tickets: TicketRow[];
    showAssignedTo?: boolean;
    showSource?: boolean;
    onViewTicket?: (ticketId: string) => void;
    onAssignTicket?: (ticketId: string) => void;
}

const priorityColors: Record<Priority, string> = {
    HIGH: 'bg-red-50 text-red-500',
    MEDIUM: 'bg-amber-50 text-amber-600',
    LOW: 'bg-blue-50 text-blue-500',
};

const statusColors: Record<TicketStatus, string> = {
    OPEN: 'bg-slate-100 text-slate-600',
    TRIAGE: 'bg-purple-100 text-purple-600',
    IN_PROGRESS: 'bg-blue-50 text-blue-600',
    RESOLVED: 'bg-green-100 text-green-600',
    CLOSED: 'bg-green-100 text-green-700',
    PENDING_REVIEW: 'bg-amber-100 text-amber-700',
    WITH_IT: 'bg-blue-100 text-blue-700',
};

const sourceColors = {
    Freshchat: 'bg-purple-50 text-purple-600',
    WhatsApp: 'bg-green-50 text-green-600',
    Email: 'bg-blue-50 text-blue-600',
    Phone: 'bg-slate-100 text-slate-600',
};

export default function TicketTable({
    tickets,
    showAssignedTo = true,
    showSource = true,
    onViewTicket,
    onAssignTicket
}: TicketTableProps) {
    return (
        <div className="bg-white rounded-[2rem] shadow-soft flex-1 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-400 uppercase">
                <div className="w-20">Ticket</div>
                <div className="flex-1">Subject</div>
                <div className="w-20">Priority</div>
                <div className="w-28">Status</div>
                {showAssignedTo && <div className="w-28">Assigned To</div>}
                {showSource && <div className="w-20">Source</div>}
                <div className="w-28">Created</div>
                <div className="w-24 text-right">Actions</div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className={`px-6 py-4 border-b border-slate-50 flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${ticket.status === 'CLOSED' ? 'opacity-60' : ''
                            } ${ticket.status === 'WITH_IT' ? 'border-l-4 border-blue-500' : ''}`}
                    >
                        <div className="w-20 text-xs font-mono font-bold text-slate-400">
                            #{ticket.ticketNumber}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">{ticket.subject}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {ticket.customerName} {ticket.customerPhone && `• ${ticket.customerPhone}`}
                            </p>
                        </div>
                        <div className="w-20">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${priorityColors[ticket.priority]}`}>
                                {ticket.priority}
                            </span>
                        </div>
                        <div className="w-28">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusColors[ticket.status]}`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                        </div>
                        {showAssignedTo && (
                            <div className="w-28">
                                {ticket.assignedTo ? (
                                    <div className="flex items-center gap-2">
                                        {ticket.assignedTo.avatar ? (
                                            <div
                                                className="size-6 rounded-full bg-cover bg-center"
                                                style={{ backgroundImage: `url('${ticket.assignedTo.avatar}')` }}
                                            />
                                        ) : (
                                            <div className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${ticket.assignedTo.role === 'IT' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {ticket.assignedTo.initials}
                                            </div>
                                        )}
                                        <span className="text-xs font-medium text-slate-600">{ticket.assignedTo.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400">Unassigned</span>
                                )}
                            </div>
                        )}
                        {showSource && (
                            <div className="w-20">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${sourceColors[ticket.source]}`}>
                                    {ticket.source}
                                </span>
                            </div>
                        )}
                        <div className="w-28 text-xs text-slate-500">{ticket.createdAt}</div>
                        <div className="w-24 flex justify-end gap-1">
                            <button
                                onClick={() => onViewTicket?.(ticket.id)}
                                className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200"
                                title="View"
                            >
                                <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
                            {!ticket.assignedTo && onAssignTicket && (
                                <button
                                    onClick={() => onAssignTicket?.(ticket.id)}
                                    className="size-7 rounded-full bg-[#EB4C36]/10 flex items-center justify-center text-[#EB4C36] hover:bg-[#EB4C36]/20"
                                    title="Assign"
                                >
                                    <span className="material-symbols-outlined text-base">person_add</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">Showing 1-{tickets.length} of {tickets.length} tickets</p>
                <div className="flex items-center gap-2">
                    <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    <button className="size-8 rounded-full bg-[#EB4C36] text-white flex items-center justify-center font-bold text-sm">
                        1
                    </button>
                    <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
