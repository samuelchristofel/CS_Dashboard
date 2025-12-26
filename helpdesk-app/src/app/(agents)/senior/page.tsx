'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ScoreCard from '@/components/dashboard/ScoreCard';
import StatCard from '@/components/dashboard/StatCard';
import TicketCard from '@/components/dashboard/TicketCard';
import AddNoteModal from '@/components/modals/AddNoteModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Ticket {
    id: string;
    number: string;
    subject: string;
    description: string | null;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: string;
    customer_name: string;
    created_at: string;
    assigned_to?: {
        id: string;
        name: string;
    };
}

interface Activity {
    id: string;
    action: string;
    details: string;
    created_at: string;
    user?: { name: string };
    ticket?: { number: string };
}

interface Stats {
    high: number;
    medium: number;
    low: number;
}

interface UserStats {
    score: number;
    assigned: number;
    active: number;
    closed: number;
}

export default function SeniorDashboardPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [stats, setStats] = useState<Stats>({ high: 0, medium: 0, low: 0 });
    const [userStats, setUserStats] = useState<UserStats>({ score: 0, assigned: 0, active: 0, closed: 0 });
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showAssignITModal, setShowAssignITModal] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get current user from localStorage
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserName(user.name || 'User');
            setUserId(user.id || '');
        }
    }, []);

    // Fetch data
    const fetchData = useCallback(async () => {
        if (!userId) return;

        setIsLoadingData(true);
        try {
            // Fetch tickets assigned to this user or unassigned
            const ticketsRes = await fetch(`/api/tickets?assigned_to=${userId}`);
            const ticketsData = await ticketsRes.json();

            // Filter for active tickets (not closed)
            const activeTickets = (ticketsData.tickets || []).filter(
                (t: Ticket) => t.status !== 'CLOSED' && t.status !== 'RESOLVED'
            );
            setTickets(activeTickets.slice(0, 5)); // Show top 5

            // Set first ticket as selected if none
            if (activeTickets.length > 0 && !selectedTicket) {
                setSelectedTicket(activeTickets[0]);
            }

            // Fetch stats
            const statsRes = await fetch(`/api/stats?user_id=${userId}`);
            const statsData = await statsRes.json();
            if (statsData.stats) {
                setStats({
                    high: statsData.stats.high,
                    medium: statsData.stats.medium,
                    low: statsData.stats.low,
                });
            }
            if (statsData.userStats) {
                setUserStats(statsData.userStats);
            }

            // Fetch recent activities
            const activitiesRes = await fetch('/api/activities?limit=5');
            const activitiesData = await activitiesRes.json();
            setActivities(activitiesData.activities || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoadingData(false);
        }
    }, [userId, selectedTicket]);

    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId, fetchData]);

    const handleAddNote = async (note: string) => {
        if (!selectedTicket) return;

        try {
            const res = await fetch(`/api/tickets/${selectedTicket.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: note, user_id: userId }),
            });
            if (res.ok) {
                toast.success('Note added!');
            }
            fetchData();
        } catch {
            toast.error('Failed to add note');
        }
    };

    const handleAssignIT = async () => {
        if (!selectedTicket) return;
        setIsLoading(true);

        try {
            const usersRes = await fetch('/api/users');
            const usersData = await usersRes.json();
            const itUser = usersData.users?.find((u: { role: string }) => u.role === 'it');

            if (itUser) {
                const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'WITH_IT',
                        assigned_to_id: itUser.id,
                        user_id: userId,
                    }),
                });
                if (res.ok) {
                    toast.success('Ticket assigned to IT!');
                }
            }
            fetchData();
        } catch {
            toast.error('Failed to assign ticket');
        }

        setIsLoading(false);
        setShowAssignITModal(false);
    };

    const handleResolve = async () => {
        if (!selectedTicket) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'RESOLVED',
                    user_id: userId,
                }),
            });
            if (res.ok) {
                toast.success('Ticket marked as resolved!');
            }
            fetchData();
        } catch {
            toast.error('Failed to resolve ticket');
        }

        setIsLoading(false);
        setShowResolveModal(false);
    };

    const handleClose = async () => {
        if (!selectedTicket) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'CLOSED',
                    user_id: userId,
                }),
            });
            if (res.ok) {
                toast.success('Ticket closed!');
            }
            fetchData();
        } catch {
            toast.error('Failed to close ticket');
        }

        setIsLoading(false);
        setShowCloseModal(false);
    };

    // Format time ago
    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    // Get activity color
    const getActivityColor = (action: string) => {
        if (action.includes('CLOSED') || action.includes('RESOLVED')) return 'green';
        if (action.includes('ESCALATED') || action.includes('IT')) return 'blue';
        if (action.includes('ASSIGNED')) return 'amber';
        return 'slate';
    };

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName}! 👋</h1>
                    <p className="text-sm text-slate-500 mt-1">Here&apos;s your performance summary</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{today}</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left Panel */}
                <div className="flex-[2] flex flex-col gap-6 min-w-0 h-full">
                    {/* Score Card */}
                    <ScoreCard
                        role="senior"
                        userName={userName}
                        score={userStats.score}
                        message={userStats.score >= 80 ? "🎯 Great job! You're on track this month." : "📈 Keep going! You're making progress."}
                    />

                    {/* Stats Row */}
                    <div className="flex gap-4">
                        <StatCard value={stats.high} label="High Priority" color="red" bordered />
                        <StatCard value={stats.medium} label="Medium" color="amber" />
                        <StatCard value={stats.low} label="Low" color="blue" />
                    </div>

                    {/* Active Tickets */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Active Tickets</h2>
                            <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                                <span className="material-symbols-outlined text-lg">sort</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                            {isLoadingData ? (
                                <div className="flex items-center justify-center py-8">
                                    <span className="size-6 border-2 border-slate-200 border-t-[#EB4C36] rounded-full animate-spin" />
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                                    <p>No active tickets</p>
                                </div>
                            ) : (
                                tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`cursor-pointer ${selectedTicket?.id === ticket.id ? 'ring-2 ring-[#EB4C36]' : ''} rounded-2xl`}
                                    >
                                        <TicketCard
                                            ticketNumber={ticket.number}
                                            subject={ticket.subject}
                                            description={ticket.description || ''}
                                            priority={ticket.priority}
                                            status={ticket.status as 'OPEN' | 'IN_PROGRESS' | 'WITH_IT'}
                                            customerName={ticket.customer_name}
                                            customerInitials={ticket.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            timeAgo={formatTimeAgo(ticket.created_at)}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-[450px] flex flex-col gap-4 min-w-0 h-full overflow-hidden">
                    {/* Senior Actions */}
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                            <span className="material-symbols-outlined text-base">bolt</span>
                            Senior Actions
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-soft flex flex-col gap-3">
                            <button
                                onClick={() => setShowNoteModal(true)}
                                disabled={!selectedTicket}
                                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">edit_note</span>
                                Add Note
                            </button>
                            <button
                                onClick={() => setShowAssignITModal(true)}
                                disabled={!selectedTicket}
                                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">engineering</span>
                                Assign to IT Support
                            </button>
                            <button
                                onClick={() => setShowResolveModal(true)}
                                disabled={!selectedTicket}
                                className="w-full bg-green-50 hover:bg-green-100 text-green-600 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">check_circle</span>
                                Mark as Resolved
                            </button>
                            <button
                                onClick={() => setShowCloseModal(true)}
                                disabled={!selectedTicket}
                                className="w-full bg-[#EB4C36] hover:bg-[#d13a25] text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#EB4C36]/30 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">lock</span>
                                Close Ticket
                            </button>
                        </div>
                    </div>

                    {/* Audit Timeline */}
                    <div className="flex-1 bg-white rounded-[2rem] shadow-soft flex flex-col overflow-hidden min-h-0">
                        <div className="p-6 pb-4 bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                                <span className="material-symbols-outlined text-slate-400 text-lg">history</span>
                                Audit Timeline
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
                            <div className="relative pl-4 mt-2 space-y-8 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="relative group">
                                        <div className={`absolute -left-4 top-0 size-3 rounded-full bg-${getActivityColor(activity.action)}-500 border-2 border-white shadow-sm`} />
                                        <div className="bg-slate-50 rounded-xl p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-bold text-${getActivityColor(activity.action)}-600`}>
                                                    {activity.action.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(activity.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">{activity.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Note Modal */}
            <AddNoteModal
                isOpen={showNoteModal}
                onClose={() => setShowNoteModal(false)}
                onSubmit={handleAddNote}
                ticketNumber={selectedTicket?.number}
            />

            {/* Assign to IT Confirmation */}
            <ConfirmModal
                isOpen={showAssignITModal}
                onClose={() => setShowAssignITModal(false)}
                onConfirm={handleAssignIT}
                title="Assign to IT Support"
                message={`This will escalate ticket #${selectedTicket?.number} to IT Support for technical investigation. The ticket status will change to 'With IT'.`}
                confirmText="Assign to IT"
                confirmColor="blue"
                isLoading={isLoading}
            />

            {/* Mark as Resolved Confirmation */}
            <ConfirmModal
                isOpen={showResolveModal}
                onClose={() => setShowResolveModal(false)}
                onConfirm={handleResolve}
                title="Mark as Resolved"
                message={`This will mark ticket #${selectedTicket?.number} as resolved. The customer will be notified.`}
                confirmText="Mark Resolved"
                confirmColor="green"
                isLoading={isLoading}
            />

            {/* Close Ticket Confirmation */}
            <ConfirmModal
                isOpen={showCloseModal}
                onClose={() => setShowCloseModal(false)}
                onConfirm={handleClose}
                title="Close Ticket"
                message={`This will permanently close ticket #${selectedTicket?.number}. Make sure all issues have been resolved before closing.`}
                confirmText="Close Ticket"
                confirmColor="red"
                isLoading={isLoading}
            />
        </>
    );
}
