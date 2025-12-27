'use client';

import { useState, useEffect } from 'react';
import TicketTable from '@/components/tickets/TicketTable';
import TicketFilters from '@/components/tickets/TicketFilters';
import { toast } from 'react-hot-toast';

export default function ITTicketsPage() {
    const [allTickets, setAllTickets] = useState<any[]>([]);
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
        if (userId) {
            fetchTickets();
        }
    }, [userId]);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            // Fetch My Tickets (assigned to me)
            const myRes = await fetch(`/api/tickets?assigned_to=${userId}`);
            const myData = await myRes.json();

            // Fetch All Technical Pool (status=WITH_IT)
            const poolRes = await fetch(`/api/tickets?status=WITH_IT`);
            const poolData = await poolRes.json();

            // Combine and deduplicate
            const allRaw = [...(myData.tickets || []), ...(poolData.tickets || [])];
            const uniqueTickets = Array.from(new Map(allRaw.map(item => [item.id, item])).values());

            if (uniqueTickets.length > 0) {
                const formatted = uniqueTickets.map((ticket: any) => ({
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
                    // Helper for filtering
                    assignedToInt: ticket.assigned_to?.id
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

    // Calculate Counts
    const counts = {
        assigned: allTickets.filter(t => t.assignedToInt === userId && (t.status === 'WITH_IT' || t.status === 'IN_PROGRESS')).length,
        pending: allTickets.filter(t => t.assignedToInt === userId && t.status === 'RESOLVED').length,
        all: allTickets.filter(t => t.status === 'WITH_IT').length
    };

    // Filter tickets for current view
    const visibleTickets = allTickets.filter(t => {
        // 1. Tab filter
        let matchesTab = false;
        if (currentTab === 'assigned') {
            matchesTab = t.assignedToInt === userId && (t.status === 'WITH_IT' || t.status === 'IN_PROGRESS');
        } else if (currentTab === 'pending') {
            matchesTab = t.assignedToInt === userId && t.status === 'RESOLVED';
        } else if (currentTab === 'all') {
            matchesTab = t.status === 'WITH_IT';
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
                    Pending CS Review
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs box-content ${currentTab === 'pending' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {counts.pending}
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
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs box-content ${currentTab === 'all' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {counts.all}
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
                    tickets={visibleTickets}
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
