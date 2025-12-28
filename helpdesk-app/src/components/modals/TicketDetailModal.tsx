'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

interface TicketDetail {
    id: string;
    ticket_number: string;
    subject: string;
    description: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: string;
    source: string;
    created_at: string;
    updated_at: string;
    assigned_at?: string;
    closed_at?: string;
    assigned_user?: {
        id: string;
        name: string;
        role: string;
    };
    notes?: {
        id: string;
        content: string;
        created_at: string;
        user: {
            name: string;
        };
    }[];
}

interface TicketDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: string | null;
}

const priorityColors = {
    HIGH: 'bg-red-50 text-red-600 border-red-200',
    MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200',
    LOW: 'bg-blue-50 text-blue-600 border-blue-200',
};

const statusColors: Record<string, string> = {
    OPEN: 'bg-slate-100 text-slate-600',
    TRIAGE: 'bg-purple-100 text-purple-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-600',
    RESOLVED: 'bg-green-100 text-green-600',
    CLOSED: 'bg-green-100 text-green-700',
    PENDING_REVIEW: 'bg-amber-100 text-amber-700',
    WITH_IT: 'bg-blue-100 text-blue-700',
};

export default function TicketDetailModal({
    isOpen,
    onClose,
    ticketId,
}: TicketDetailModalProps) {
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && ticketId) {
            fetchTicket();
        } else {
            setTicket(null);
        }
    }, [isOpen, ticketId]);

    const fetchTicket = async () => {
        if (!ticketId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/tickets/${ticketId}`);
            if (!res.ok) throw new Error('Failed to fetch ticket');
            const data = await res.json();
            setTicket(data);
        } catch (error) {
            console.error('Error fetching ticket:', error);
            toast.error('Failed to load ticket details');
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ticket Details" size="xl">
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="size-8 border-2 border-slate-200 border-t-[#EB4C36] rounded-full animate-spin" />
                </div>
            ) : ticket ? (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-mono text-slate-400 mb-1">
                                #{ticket.ticket_number}
                            </p>
                            <h3 className="text-lg font-bold text-slate-900">
                                {ticket.subject}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColors[ticket.priority]}`}>
                                {ticket.priority}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[ticket.status] || 'bg-slate-100 text-slate-600'}`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    {ticket.description && (
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Description</h4>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </div>
                    )}

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Customer</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                                    <span className="text-sm font-medium text-slate-700">{ticket.customer_name}</span>
                                </div>
                                {ticket.customer_email && (
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">email</span>
                                        <span className="text-sm text-slate-600">{ticket.customer_email}</span>
                                    </div>
                                )}
                                {ticket.customer_phone && (
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">phone</span>
                                        <span className="text-sm text-slate-600">{ticket.customer_phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Source:</span>
                                    <span className="font-medium text-slate-700">{ticket.source}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Created:</span>
                                    <span className="font-medium text-slate-700">{formatDate(ticket.created_at)}</span>
                                </div>
                                {ticket.assigned_user && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Assigned to:</span>
                                        <span className="font-medium text-slate-700">
                                            {ticket.assigned_user.name} ({ticket.assigned_user.role})
                                        </span>
                                    </div>
                                )}
                                {ticket.closed_at && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Closed:</span>
                                        <span className="font-medium text-slate-700">{formatDate(ticket.closed_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {ticket.notes && ticket.notes.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Notes ({ticket.notes.length})</h4>
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                                {ticket.notes.map((note) => (
                                    <div key={note.id} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                                        <p className="text-sm text-slate-700">{note.content}</p>
                                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                                            <span className="font-medium">{note.user.name}</span>
                                            <span>{formatDate(note.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </Modal>
    );
}
