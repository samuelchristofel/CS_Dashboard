'use client';

import { useState, useEffect } from 'react';
import TicketTable from '@/components/tickets/TicketTable';
import TicketFilters from '@/components/tickets/TicketFilters';
import TicketDetailModal from '@/components/modals/TicketDetailModal';
import { toast } from 'react-hot-toast';

export default function JuniorTicketsPage() {
    const [allTickets, setAllTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState<'assigned' | 'pending' | 'completed'>('assigned');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // Fetch all tickets assigned to user
            const params = new URLSearchParams();
            params.append('assigned_to', user.id);

            const res = await fetch(`/api/tickets?${params.toString()}`);
            const data = await res.json();

            if (data.tickets) {
                // Transform all data first
                const formatted = data.tickets.map((ticket: any) => ({
                    id: ticket.id,
                    ticketNumber: ticket.number,
                    subject: ticket.subject,
                    customerName: ticket.customer_name,
                    customerPhone: ticket.customer_phone,
                    priority: ticket.priority,
                    status: ticket.status,
                    source: ticket.source,
                    assignedTo: ticket.assigned_to ? {
                        name: ticket.assigned_to.name,
                        initials: ticket.assigned_to.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2),
                        role: ticket.assigned_to.role === 'it' ? 'IT' : undefined,
                    } : undefined,
                    createdAt: new Date(ticket.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                    }),
                }));

                setAllTickets(formatted);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load tickets');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate counts
    const counts = {
        assigned: allTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
        pending: allTickets.filter(t => t.status === 'PENDING_REVIEW').length,
        completed: allTickets.filter(t => t.status === 'CLOSED' || t.status === 'RESOLVED').length
    };

    // Filter tickets for current view
    const visibleTickets = allTickets.filter(t => {
        // 1. Tab filter
        let matchesTab = false;
        if (currentTab === 'assigned') {
            matchesTab = t.status === 'OPEN' || t.status === 'IN_PROGRESS';
        } else if (currentTab === 'pending') {
            matchesTab = t.status === 'PENDING_REVIEW';
        } else {
            matchesTab = t.status === 'CLOSED' || t.status === 'RESOLVED';
        }

        // 2. Search & Dropdown filters
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.ticketNumber.includes(searchQuery) ||
            t.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter ? t.status === statusFilter : true;
        const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;

        return matchesTab && matchesSearch && matchesStatus && matchesPriority;
    });

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
                    <p className="text-sm text-slate-500 mt-1">Tickets assigned to you</p>
                </div>
                <TicketFilters
                    showCreateButton={false}
                    onSearch={setSearchQuery}
                    onStatusChange={setStatusFilter}
                    onPriorityChange={setPriorityFilter}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-full p-1.5 shadow-soft w-fit">
                <button
                    onClick={() => setCurrentTab('assigned')}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${currentTab === 'assigned'
                        ? 'bg-[#EB4C36] text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    Active
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs box-content ${currentTab === 'assigned' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {counts.assigned}
                    </span>
                </button>
                <button
                    onClick={() => setCurrentTab('pending')}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${currentTab === 'pending'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    Pending Review
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs box-content ${currentTab === 'pending' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {counts.pending}
                    </span>
                </button>
                <button
                    onClick={() => setCurrentTab('completed')}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${currentTab === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    Completed
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs box-content ${currentTab === 'completed' ? 'bg-green-200/50' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {counts.completed}
                    </span>
                </button>
            </div>

            {/* Ticket Table */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="size-8 border-2 border-slate-200 border-t-[#EB4C36] rounded-full animate-spin" />
                </div>
            ) : (
                <TicketTable
                    tickets={visibleTickets}
                    showAssignedTo={false}
                    showSource={true}
                    onViewTicket={(id) => setSelectedTicketId(id)}
                />
            )}

            {/* Ticket Detail Modal */}
            <TicketDetailModal
                isOpen={!!selectedTicketId}
                onClose={() => setSelectedTicketId(null)}
                ticketId={selectedTicketId}
            />
        </>
    );
}
