'use client';

import { useState, useEffect } from 'react';
import TicketTable from '@/components/tickets/TicketTable';
import TicketFilters from '@/components/tickets/TicketFilters';
import { toast } from 'react-hot-toast';

export default function ITTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState<'assigned' | 'pending' | 'all'>('assigned');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUserId(JSON.parse(userStr).id);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [currentTab, userId]);

    const fetchTickets = async () => {
        if (!userId && currentTab !== 'all') return;

        setIsLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();

            // For "All Technical", we fetch all tickets with WITH_IT status
            // For others, we fetch tickets assigned to current user
            if (currentTab === 'all') {
                params.append('status', 'WITH_IT');
            } else {
                params.append('assigned_to', userId);
            }

            const res = await fetch(`/api/tickets?${params.toString()}`);
            const data = await res.json();

            if (data.tickets) {
                // Transform and filter data
                const filtered = data.tickets.filter((t: any) => {
                    // Tab filter
                    if (currentTab === 'assigned') {
                        // Tickets I am working on (e.g. WITH_IT or IN_PROGRESS)
                        return t.status === 'WITH_IT' || t.status === 'IN_PROGRESS';
                    } else if (currentTab === 'pending') {
                        // Tickets I resolved, waiting for CS review
                        return t.status === 'RESOLVED';
                    }
                    return true;
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

    const getTabCount = (tab: string) => {
        // This is a simplified count since we're only loading one tab's data at a time usually
        // Ideally we'd fetch counts separately. For now, rely on active tab length
        if (tab === currentTab) return tickets.length;
        return '';
    };

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
                            ? 'bg-blue-500 text-white'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    Assigned to Me
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs box-content">
                        {currentTab === 'assigned' ? tickets.length : ''}
                    </span>
                </button>
                <button
                    onClick={() => setCurrentTab('pending')}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${currentTab === 'pending'
                            ? 'bg-green-100 text-green-600'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    Pending CS Review
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs box-content border border-current">
                        {currentTab === 'pending' ? tickets.length : ''}
                    </span>
                </button>
                <button
                    onClick={() => setCurrentTab('all')}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${currentTab === 'all'
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    All Technical
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs box-content">
                        {currentTab === 'all' ? tickets.length : ''}
                    </span>
                </button>
            </div>

            {/* Ticket Table */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="size-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
            ) : (
                <TicketTable
                    tickets={filteredTickets}
                    showAssignedTo={currentTab === 'all'}
                    showSource={false}
                    onViewTicket={(id) => {
                        console.log('View ticket', id);
                    }}
                />
            )}
        </>
    );
}
