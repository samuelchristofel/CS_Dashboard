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
    } | null;
    created_by?: {
        name: string;
    };
}

interface Activity {
    id: string;
    action: string;
    details: string;
    created_at: string;
}

export default function JuniorDashboardPage() {
    const [myTickets, setMyTickets] = useState<Ticket[]>([]);
    const [availableTickets, setAvailableTickets] = useState<Ticket[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [stats, setStats] = useState({ open: 0, resolved: 0, total: 0, available: 0 });
    const [userScore, setUserScore] = useState(0);

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'my' | 'available'>('my');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserName(user.name || 'User');
            setUserId(user.id || '');
        }
    }, []);

    const fetchData = useCallback(async () => {
        if (!userId) return;

        setIsLoadingData(true);
        try {
            // Fetch MY tickets (assigned to me)
            const myTicketsRes = await fetch(`/api/tickets?assigned_to=${userId}`);
            const myTicketsData = await myTicketsRes.json();
            const activeMyTickets = (myTicketsData.tickets || []).filter(
                (t: Ticket) => t.status !== 'CLOSED' && t.status !== 'RESOLVED'
            );
            setMyTickets(activeMyTickets);

            // Fetch AVAILABLE tickets (unassigned, LOW/MEDIUM priority only for Junior)
            const availableRes = await fetch('/api/tickets?unassigned=true');
            const availableData = await availableRes.json();
            const availableLowMedium = (availableData.tickets || []).filter(
                (t: Ticket) =>
                    (t.priority === 'LOW' || t.priority === 'MEDIUM') &&
                    t.status !== 'CLOSED' &&
                    t.status !== 'RESOLVED'
            );
            setAvailableTickets(availableLowMedium);

            // Update stats
            const statsRes = await fetch(`/api/stats?user_id=${userId}`);
            const statsData = await statsRes.json();
            if (statsData.userStats) {
                setUserScore(statsData.userStats.score);
                setStats({
                    open: statsData.userStats.active,
                    resolved: statsData.userStats.closed,
                    total: statsData.userStats.assigned,
                    available: availableLowMedium.length,
                });
            } else {
                setStats(prev => ({ ...prev, available: availableLowMedium.length }));
            }

            // Fetch activities
            const activitiesRes = await fetch(`/api/activities?user_id=${userId}&limit=10`);
            const activitiesData = await activitiesRes.json();
            setActivities(activitiesData.activities || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoadingData(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) fetchData();
    }, [userId, fetchData]);

    // Handle default selection based on active tab
    useEffect(() => {
        const currentList = activeTab === 'my' ? myTickets : availableTickets;
        if (currentList.length > 0 && !selectedTicket) {
            setSelectedTicket(currentList[0]);
        }
    }, [myTickets, availableTickets, selectedTicket, activeTab]);

    // Update selected ticket data when tickets refresh
    useEffect(() => {
        if (selectedTicket) {
            const allTickets = [...myTickets, ...availableTickets];
            const updated = allTickets.find(t => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
        }
    }, [myTickets, availableTickets, selectedTicket]);

    const handleAddNote = async (note: string) => {
        if (!selectedTicket) return;
        try {
            const res = await fetch(`/api/tickets/${selectedTicket.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Note',
                    content: note,
                    user_id: userId
                }),
            });
            if (res.ok) toast.success('Note added!');
            fetchData();
        } catch {
            toast.error('Failed to add note');
        }
    };

    // CLAIM TICKET - Self-assignment (initiative bonus)
    const handleClaimTicket = async () => {
        if (!selectedTicket) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assigned_to_id: userId,
                    status: 'IN_PROGRESS',
                    user_id: userId,
                }),
            });
            if (res.ok) {
                toast.success(`Ticket #${selectedTicket.number} claimed! 🎯`);
                setActiveTab('my');
                setSelectedTicket(null);
            }
            fetchData();
        } catch {
            toast.error('Failed to claim ticket');
        }

        setIsLoading(false);
        setShowClaimModal(false);
    };

    // RESOLVE TICKET - Direct resolve (no pending review for LOW/MEDIUM)
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
                toast.success('Ticket resolved! ✅');
                setSelectedTicket(null);
            }
            fetchData();
        } catch {
            toast.error('Failed to resolve ticket');
        }

        setIsLoading(false);
        setShowResolveModal(false);
    };

    // ESCALATE TO IT - For MEDIUM/HIGH priority tickets
    const handleEscalateToIT = async () => {
        if (!selectedTicket) return;
        setIsLoading(true);

        try {
            // Find an IT user
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
                    toast.success('Ticket escalated to IT Support! 🔧');
                    setSelectedTicket(null);
                }
            } else {
                toast.error('No IT support user found');
            }
            fetchData();
        } catch {
            toast.error('Failed to escalate ticket');
        }

        setIsLoading(false);
        setShowEscalateModal(false);
    };

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffMs / 86400000)}d ago`;
    };

    const getActivityColor = (action: string) => {
        if (action.includes('CLOSED') || action.includes('RESOLVED')) return 'green';
        if (action.includes('ESCALATED') || action.includes('IT')) return 'blue';
        if (action.includes('CLAIMED') || action.includes('ASSIGNED')) return 'amber';
        return 'slate';
    };

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Determine which tickets to display based on active tab
    const displayTickets = activeTab === 'my' ? myTickets : availableTickets;

    // Check if escalate should be available (MEDIUM or HIGH priority, and ticket is assigned to me)
    const canEscalate = selectedTicket &&
        (selectedTicket.priority === 'MEDIUM' || selectedTicket.priority === 'HIGH') &&
        selectedTicket.assigned_to?.id === userId;

    // Check if this is an available ticket (for claim button)
    const isAvailableTicket = selectedTicket && !selectedTicket.assigned_to;

    // Check if this is my ticket (for resolve button)
    const isMyTicket = selectedTicket && selectedTicket.assigned_to?.id === userId;

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName}! 👋</h1>
                    <p className="text-sm text-slate-500 mt-1">Here&apos;s your performance summary</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{today}</span>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                <div className="flex-[1.2] flex flex-col gap-6 overflow-hidden">
                    <ScoreCard
                        role="junior"
                        userName={userName}
                        score={userScore}
                        message={userScore >= 70 ? "✨ Good progress! Keep it up!" : "⚠️ Need improvement - keep working on tickets."}
                    />

                    <div className="flex gap-4">
                        <StatCard value={stats.open} label="My Active" color="primary" bordered />
                        <StatCard value={stats.resolved} label="Resolved" color="green" />
                        <StatCard value={stats.available} label="Available" color="amber" />
                    </div>

                    {/* Tickets Section with Tabs */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Tab Headers */}
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => {
                                    setActiveTab('my');
                                    setSelectedTicket(myTickets[0] || null);
                                }}
                                className={`text-lg font-bold transition-colors ${activeTab === 'my'
                                        ? 'text-slate-900'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                My Tickets
                                {myTickets.length > 0 && (
                                    <span className="ml-2 text-sm bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                                        {myTickets.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('available');
                                    setSelectedTicket(availableTickets[0] || null);
                                }}
                                className={`text-lg font-bold transition-colors ${activeTab === 'available'
                                        ? 'text-slate-900'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                Available to Claim
                                {availableTickets.length > 0 && (
                                    <span className="ml-2 text-sm bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full animate-pulse">
                                        {availableTickets.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar p-1">
                            {isLoadingData ? (
                                <div className="flex items-center justify-center py-8">
                                    <span className="size-6 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                                </div>
                            ) : displayTickets.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                                    <p>{activeTab === 'my' ? 'No tickets assigned to you' : 'No tickets available to claim'}</p>
                                    {activeTab === 'my' && availableTickets.length > 0 && (
                                        <button
                                            onClick={() => setActiveTab('available')}
                                            className="mt-3 text-emerald-600 font-semibold hover:underline"
                                        >
                                            View {availableTickets.length} available ticket(s) →
                                        </button>
                                    )}
                                </div>
                            ) : (
                                displayTickets.map((ticket) => (
                                    <TicketCard
                                        key={ticket.id}
                                        ticketNumber={ticket.number}
                                        subject={ticket.subject}
                                        description={ticket.description || ''}
                                        priority={ticket.priority}
                                        status={ticket.status as 'OPEN' | 'IN_PROGRESS'}
                                        customerName={ticket.customer_name}
                                        customerInitials={ticket.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        timeAgo={formatTimeAgo(ticket.created_at)}
                                        selected={selectedTicket?.id === ticket.id}
                                        accentColor={activeTab === 'my' ? '#10B981' : '#F59E0B'}
                                        onClick={() => setSelectedTicket(ticket)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Actions & Details */}
                <div className="w-[450px] flex flex-col gap-4 min-w-0 overflow-hidden">
                    {/* CS Actions */}
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                            <span className="material-symbols-outlined text-base">support_agent</span>
                            CS Actions
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-soft flex flex-col gap-3">
                            <button
                                onClick={() => setShowNoteModal(true)}
                                disabled={!selectedTicket}
                                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">edit_note</span>
                                Add Note
                            </button>

                            {/* CLAIM BUTTON - Only for available tickets */}
                            {isAvailableTicket && (
                                <button
                                    onClick={() => setShowClaimModal(true)}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-amber-500/30"
                                >
                                    <span className="material-symbols-outlined">front_hand</span>
                                    Claim This Ticket
                                </button>
                            )}

                            {/* RESOLVE BUTTON - Only for my tickets */}
                            {isMyTicket && (
                                <button
                                    onClick={() => setShowResolveModal(true)}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-emerald-500/30"
                                >
                                    <span className="material-symbols-outlined">task_alt</span>
                                    Mark as Resolved
                                </button>
                            )}

                            {/* ESCALATE TO IT BUTTON - For MEDIUM/HIGH priority my tickets */}
                            {canEscalate && (
                                <button
                                    onClick={() => setShowEscalateModal(true)}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    <span className="material-symbols-outlined">engineering</span>
                                    Escalate to IT Support
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="flex-1 bg-white rounded-2xl shadow-soft flex flex-col overflow-hidden min-h-0">
                        {selectedTicket ? (
                            <>
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-base font-bold">Ticket #{selectedTicket.number}</h3>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${selectedTicket.priority === 'HIGH' ? 'bg-red-50 text-red-600' :
                                                selectedTicket.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-green-50 text-green-600'
                                            }`}>
                                            {selectedTicket.priority}
                                        </span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isAvailableTicket
                                            ? 'text-amber-600 bg-amber-50'
                                            : 'text-emerald-600 bg-emerald-50'
                                        }`}>
                                        {isAvailableTicket ? 'AVAILABLE' : selectedTicket.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Ticket Info */}
                                <div className="px-6 py-4 flex-shrink-0 border-b border-slate-50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                        <span className="material-symbols-outlined text-base">info</span>
                                        Ticket Details
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Issue Type</p>
                                            <p className="text-sm font-semibold text-slate-700 mt-1 truncate">{selectedTicket.subject}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Customer</p>
                                            <p className="text-sm font-semibold text-slate-700 mt-1 truncate">{selectedTicket.customer_name}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Created</p>
                                            <p className="text-sm font-semibold text-slate-700 mt-1 truncate">
                                                {formatTimeAgo(selectedTicket.created_at)}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Priority</p>
                                            <p className={`text-sm font-semibold mt-1 ${selectedTicket.priority === 'HIGH' ? 'text-red-600' :
                                                    selectedTicket.priority === 'MEDIUM' ? 'text-amber-600' :
                                                        'text-green-600'
                                                }`}>
                                                {selectedTicket.priority.charAt(0) + selectedTicket.priority.slice(1).toLowerCase()}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedTicket.description && (
                                        <div className="mt-3 bg-slate-50 p-3 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Description</p>
                                            <p className="text-sm text-slate-600">{selectedTicket.description}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Logs */}
                                <div className="px-6 pt-4 pb-2 flex-shrink-0">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">history</span>
                                        Logs
                                    </div>
                                </div>

                                {/* Scrollable Activity List */}
                                <div className="flex-1 overflow-y-auto px-6 pb-4 no-scrollbar">
                                    <div className="space-y-3">
                                        {activities.map((activity) => (
                                            <div key={activity.id} className="bg-slate-50 p-3 rounded-xl group hover:bg-white hover:shadow-card transition-all">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-bold text-slate-900 truncate pr-2">{activity.details}</p>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                        {new Date(activity.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[10px] font-bold text-${getActivityColor(activity.action)}-600 uppercase`}>
                                                        {activity.action.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {formatTimeAgo(activity.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {activities.length === 0 && (
                                            <p className="text-center text-slate-400 text-sm py-4">No recent activity</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                                <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
                                <p>Select a ticket to view details</p>
                            </div>
                        )}
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

            {/* Claim Ticket Confirmation */}
            <ConfirmModal
                isOpen={showClaimModal}
                onClose={() => setShowClaimModal(false)}
                onConfirm={handleClaimTicket}
                title="Claim This Ticket"
                message={`You're about to claim ticket #${selectedTicket?.number}. This will assign it to you and show initiative! 🎯`}
                confirmText="Claim Ticket"
                confirmColor="amber"
                isLoading={isLoading}
            />

            {/* Resolve Ticket Confirmation */}
            <ConfirmModal
                isOpen={showResolveModal}
                onClose={() => setShowResolveModal(false)}
                onConfirm={handleResolve}
                title="Mark as Resolved"
                message={`This will mark ticket #${selectedTicket?.number} as resolved. The customer issue has been addressed.`}
                confirmText="Mark Resolved"
                confirmColor="green"
                isLoading={isLoading}
            />

            {/* Escalate to IT Confirmation */}
            <ConfirmModal
                isOpen={showEscalateModal}
                onClose={() => setShowEscalateModal(false)}
                onConfirm={handleEscalateToIT}
                title="Escalate to IT Support"
                message={`This will escalate ticket #${selectedTicket?.number} to IT Support for technical investigation.`}
                confirmText="Escalate to IT"
                confirmColor="blue"
                isLoading={isLoading}
            />
        </>
    );
}
