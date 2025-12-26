'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import TicketTable from '@/components/tickets/TicketTable';
import TicketFilters from '@/components/tickets/TicketFilters';
import CreateTicketModal from '@/components/modals/CreateTicketModal';
import AssignTicketModal from '@/components/modals/AssignTicketModal';
import type { TicketFormData } from '@/components/modals/CreateTicketModal';

interface Ticket {
    id: string;
    number: string;
    subject: string;
    customer_name: string;
    customer_phone: string | null;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: string;
    source: string;
    created_at: string;
    assigned_to?: {
        id: string;
        name: string;
        avatar?: string;
        role?: string;
    };
}

interface Agent {
    id: string;
    name: string;
    role: string;
}

interface Stats {
    total: number;
    pendingReview: number;
    withIT: number;
    closed: number;
}

export default function SeniorTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, pendingReview: 0, withIT: 0, closed: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [userId, setUserId] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

    // Get current user
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserId(user.id || '');
        }
    }, []);

    // Fetch data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch tickets based on active tab
            let url = '/api/tickets';
            if (activeTab === 'pending') url += '?status=PENDING_REVIEW';
            else if (activeTab === 'it') url += '?status=WITH_IT';
            else if (activeTab === 'closed') url += '?status=CLOSED';

            const ticketsRes = await fetch(url);
            const ticketsData = await ticketsRes.json();
            setTickets(ticketsData.tickets || []);

            // Fetch stats
            const statsRes = await fetch('/api/stats');
            const statsData = await statsRes.json();
            if (statsData.stats) {
                setStats({
                    total: statsData.stats.total - statsData.stats.closed,
                    pendingReview: statsData.stats.pendingReview,
                    withIT: statsData.stats.withIT,
                    closed: statsData.stats.closed,
                });
            }

            // Fetch agents for assignment
            const usersRes = await fetch('/api/users');
            const usersData = await usersRes.json();
            const agentList = (usersData.users || [])
                .filter((u: { role: string }) => u.role !== 'admin')
                .map((u: { id: string; name: string; role: string }) => ({
                    id: u.id,
                    name: u.name,
                    role: u.role === 'senior' ? 'Senior CS' : u.role === 'junior' ? 'Junior CS' : 'IT Support',
                }));
            setAgents(agentList);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateTicket = async (data: TicketFormData) => {
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: data.subject,
                    description: data.description,
                    priority: data.priority,
                    source: data.source,
                    customer_name: data.customerName,
                    customer_email: data.customerEmail,
                    customer_phone: data.customerPhone,
                    created_by_id: userId,
                }),
            });
            if (res.ok) {
                toast.success('Ticket created successfully!');
            } else {
                toast.error('Failed to create ticket');
            }
            fetchData();
        } catch {
            toast.error('Network error');
        }
    };

    const handleAssignTicket = async (agentId: string) => {
        if (!selectedTicket) return;

        try {
            const res = await fetch(`/api/tickets/${selectedTicket}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assigned_to_id: agentId,
                    status: 'IN_PROGRESS',
                    user_id: userId,
                }),
            });
            if (res.ok) {
                toast.success('Ticket assigned successfully!');
            } else {
                toast.error('Failed to assign ticket');
            }
            setShowAssignModal(false);
            setSelectedTicket(null);
            fetchData();
        } catch {
            toast.error('Network error');
        }
    };

    // Format ticket data for TicketTable
    const formattedTickets = tickets.map(t => ({
        id: t.id,
        ticketNumber: t.number,
        subject: t.subject,
        customerName: t.customer_name,
        customerPhone: t.customer_phone || undefined,
        priority: t.priority,
        status: t.status as 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'PENDING_REVIEW' | 'WITH_IT',
        source: t.source as 'Freshchat' | 'WhatsApp' | 'Email' | 'Phone',
        assignedTo: t.assigned_to ? {
            name: t.assigned_to.name,
            initials: t.assigned_to.name.split(' ').map(n => n[0]).join('').slice(0, 2),
            avatar: t.assigned_to.avatar,
            role: t.assigned_to.role === 'it' ? 'IT' : undefined,
        } : undefined,
        createdAt: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    }));

    const selectedTicketData = formattedTickets.find(t => t.id === selectedTicket);

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
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'all' ? 'bg-[#EB4C36] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    All Tickets
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>{stats.total}</span>
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${activeTab === 'pending' ? 'bg-[#EB4C36] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    Pending Review
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === 'pending' ? 'bg-white/20' : 'bg-amber-100 text-amber-600'}`}>{stats.pendingReview}</span>
                </button>
                <button
                    onClick={() => setActiveTab('it')}
                    className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${activeTab === 'it' ? 'bg-[#EB4C36] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    With IT
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === 'it' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>{stats.withIT}</span>
                </button>
                <button
                    onClick={() => setActiveTab('closed')}
                    className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${activeTab === 'closed' ? 'bg-[#EB4C36] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    Closed
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === 'closed' ? 'bg-white/20' : 'bg-slate-100'}`}>{stats.closed}</span>
                </button>
            </div>

            {/* Ticket Table */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="size-8 border-2 border-slate-200 border-t-[#EB4C36] rounded-full animate-spin" />
                </div>
            ) : (
                <TicketTable
                    tickets={formattedTickets}
                    showAssignedTo={true}
                    showSource={true}
                    onViewTicket={(id) => {
                        setSelectedTicket(id);
                        // TODO: Open detail modal
                    }}
                    onAssignTicket={(id) => {
                        setSelectedTicket(id);
                        setShowAssignModal(true);
                    }}
                />
            )}

            {/* Create Ticket Modal */}
            <CreateTicketModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateTicket}
            />

            {/* Assign Ticket Modal */}
            <AssignTicketModal
                isOpen={showAssignModal}
                onClose={() => {
                    setShowAssignModal(false);
                    setSelectedTicket(null);
                }}
                onSubmit={handleAssignTicket}
                ticketNumber={selectedTicketData?.ticketNumber || ''}
                currentAssignee={selectedTicketData?.assignedTo?.name}
                agents={agents}
            />
        </>
    );
}
