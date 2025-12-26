'use client';

import { useState, useEffect } from 'react';
import TicketTable from '@/components/tickets/TicketTable';
import TicketFilters from '@/components/tickets/TicketFilters';
import { toast } from 'react-hot-toast';

export default function JuniorTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState<'assigned' | 'completed'>('assigned');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    useEffect(() => {
        fetchTickets();
    }, [currentTab]);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // Build query params
            const params = new URLSearchParams();
            params.append('assigned_to', user.id);

            // Apply filtering logic based on tab
            // Note: The API currently supports only exact match. 
            // For complex "not equal" logic we might need to fetch more and filter client side 
            // or update API. For now, let's fetch all assigned to user and filter client side.

            const res = await fetch(`/api/tickets?${params.toString()}`);
            const data = await res.json();

            if (data.tickets) {
                // Transform and filter data
                const filtered = data.tickets.filter((t: any) => {
                    // Tab filter
                    if (currentTab === 'assigned') {
                        return t.status !== 'CLOSED' && t.status !== 'RESOLVED' && t.status !== 'PENDING_REVIEW';
                    } else {
                        return t.status === 'CLOSED' || t.status === 'RESOLVED' || t.status === 'PENDING_REVIEW';
                    }
                }).map((ticket: any) => ({
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

                setTickets(filtered);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load tickets');
        } finally {
            setIsLoading(false);
        }
    };

    // Client-side filtering for search and dropdowns
    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.ticketNumber.includes(searchQuery) ||
            t.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter ? t.status === statusFilter : true;
        const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;

        return matchesSearch && matchesStatus && matchesPriority;
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
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    Assigned to Me
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs box-content">
                        {currentTab === 'assigned' ? tickets.length : ''}
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
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs border border-current box-content">
                        {currentTab === 'completed' ? tickets.length : ''}
                    </span>
                </button>
            </div>

            {/* Ticket Table */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="size-8 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            ) : (
                <TicketTable
                    tickets={filteredTickets}
                    showAssignedTo={false}
                    showSource={true}
                    onViewTicket={(id) => {
                        console.log('View ticket', id);
                        // TODO: Open view modal
                    }}
                />
            )}
        </>
    );
}
