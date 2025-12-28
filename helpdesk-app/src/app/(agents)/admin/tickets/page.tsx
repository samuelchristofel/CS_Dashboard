'use client';

import { useState, useEffect } from 'react';
import TicketTable from '@/components/tickets/TicketTable';
import TicketFilters from '@/components/tickets/TicketFilters';
import CreateTicketModal, { TicketFormData } from '@/components/modals/CreateTicketModal';
import AssignTicketModal from '@/components/modals/AssignTicketModal';
import { toast } from 'react-hot-toast';

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ total: 0, open: 0, high: 0, pendingReview: 0, withIT: 0, closed: 0 });
    const [agents, setAgents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    const [editingTicket, setEditingTicket] = useState<TicketFormData | null>(null);
    const [editingTicketId, setEditingTicketId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch tickets
            const ticketsRes = await fetch('/api/tickets');
            const ticketsData = await ticketsRes.json();

            // Fetch stats
            const statsRes = await fetch('/api/stats');
            const statsData = await statsRes.json();

            // Fetch users (agents) for assignment
            const usersRes = await fetch('/api/users');
            const usersData = await usersRes.json();

            if (ticketsData.tickets) {
                setTickets(ticketsData.tickets.map((ticket: any) => ({
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
                        avatar: ticket.assigned_to.avatar
                    } : undefined,
                    createdAt: new Date(ticket.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                    }),
                })));
            }

            if (statsData.stats) {
                setStats(statsData.stats);
            }

            if (usersData.users) {
                setAgents(usersData.users.filter((u: any) => u.role !== 'admin').map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    role: u.role === 'senior' ? 'Senior CS' : u.role === 'junior' ? 'Junior CS' : 'IT Support'
                })));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditTicket = async (id: string) => {
        const loadingToast = toast.loading('Loading ticket details...');
        try {
            const res = await fetch(`/api/tickets/${id}`);
            const data = await res.json();

            if (data.ticket) {
                setEditingTicket({
                    subject: data.ticket.subject,
                    description: data.ticket.description || '',
                    priority: data.ticket.priority,
                    source: data.ticket.source,
                    customerName: data.ticket.customer_name,
                    customerEmail: data.ticket.customer_email || '',
                    customerPhone: data.ticket.customer_phone || '',
                });
                setEditingTicketId(id);
                setShowCreateModal(true);
                toast.dismiss(loadingToast);
            }
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            toast.error('Failed to load ticket details', { id: loadingToast });
        }
    };

    const handleCreateOrUpdateTicket = async (data: TicketFormData) => {
        const loadingToast = toast.loading(editingTicketId ? 'Updating ticket...' : 'Creating ticket...');
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (editingTicketId) {
                // Update
                const res = await fetch(`/api/tickets/${editingTicketId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject: data.subject,
                        description: data.description,
                        priority: data.priority,
                        source: data.source,
                        customer_name: data.customerName,
                        customer_email: data.customerEmail,
                        customer_phone: data.customerPhone,
                        user_id: user?.id,
                    }),
                });

                if (!res.ok) throw new Error('Failed to update ticket');
                toast.success('Ticket updated successfully', { id: loadingToast });
            } else {
                // Create
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
                        created_by_id: user?.id,
                    }),
                });

                if (!res.ok) throw new Error('Failed to create ticket');
                toast.success('Ticket created successfully', { id: loadingToast });
            }

            setShowCreateModal(false);
            setEditingTicket(null);
            setEditingTicketId(null);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Save ticket error:', error);
            toast.error(editingTicketId ? 'Failed to update ticket' : 'Failed to create ticket', { id: loadingToast });
        }
    };

    const handleAssignTicket = async (agentId: string) => {
        if (!selectedTicketId) return;

        const loadingToast = toast.loading('Assigning ticket...');
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            const res = await fetch(`/api/tickets/${selectedTicketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assigned_to_id: agentId,
                    user_id: user?.id,
                }),
            });

            if (!res.ok) throw new Error('Failed to assign ticket');

            toast.success('Ticket assigned successfully', { id: loadingToast });
            setShowAssignModal(false);
            setSelectedTicketId(null);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Assign ticket error:', error);
            toast.error('Failed to assign ticket', { id: loadingToast });
        }
    };

    const selectedTicketData = tickets.find(t => t.id === selectedTicketId);

    // Client-side filtering
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
                    <h1 className="text-2xl font-bold text-slate-900">All Tickets</h1>
                    <p className="text-sm text-slate-500 mt-1">View and manage all system tickets</p>
                </div>
                <TicketFilters
                    showCreateButton={true}
                    onCreateClick={() => setShowCreateModal(true)}
                    onSearch={setSearchQuery}
                    onStatusChange={setStatusFilter}
                    onPriorityChange={setPriorityFilter}
                />
            </div>

            {/* Stats Row */}
            <div className="flex gap-4">
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-soft">
                    <p className="text-3xl font-extrabold text-slate-900">{stats.open || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Total Open</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-soft">
                    <p className="text-3xl font-extrabold text-red-500">{stats.high || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">High Priority</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-soft">
                    <p className="text-3xl font-extrabold text-amber-500">{stats.pendingReview || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Pending Review</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-soft">
                    <p className="text-3xl font-extrabold text-blue-500">{stats.withIT || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">With IT</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-soft">
                    <p className="text-3xl font-extrabold text-emerald-500">{stats.resolved || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Resolved</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-4 shadow-soft">
                    <p className="text-3xl font-extrabold text-green-500">{stats.closed || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Closed</p>
                </div>
            </div>

            {/* Ticket Table */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="size-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                </div>
            ) : (
                <TicketTable
                    tickets={filteredTickets}
                    showAssignedTo={true}
                    showSource={true}
                    onViewTicket={(id) => {
                        console.log('View ticket', id);
                    }}
                    onEditTicket={handleEditTicket}
                    onAssignTicket={(id) => {
                        setSelectedTicketId(id);
                        setShowAssignModal(true);
                    }}
                />
            )}

            {/* Create/Edit Ticket Modal */}
            <CreateTicketModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingTicket(null);
                    setEditingTicketId(null);
                }}
                onSubmit={handleCreateOrUpdateTicket}
                initialData={editingTicket}
                mode={editingTicketId ? 'edit' : 'create'}
            />

            {/* Assign Ticket Modal */}
            <AssignTicketModal
                isOpen={showAssignModal}
                onClose={() => {
                    setShowAssignModal(false);
                    setSelectedTicketId(null);
                }}
                onSubmit={handleAssignTicket}
                ticketNumber={selectedTicketData?.ticketNumber || ''}
                currentAssignee={selectedTicketData?.assignedTo?.name}
                agents={agents}
            />
        </>
    );
}
