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
}

export default function JuniorDashboardPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [stats, setStats] = useState({ open: 0, resolved: 0, total: 0 });
    const [userScore, setUserScore] = useState(0);

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showDoneModal, setShowDoneModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            const ticketsRes = await fetch(`/api/tickets?assigned_to=${userId}`);
            const ticketsData = await ticketsRes.json();

            const activeTickets = (ticketsData.tickets || []).filter(
                (t: Ticket) => t.status !== 'CLOSED' && t.status !== 'RESOLVED'
            );
            setTickets(activeTickets);
            if (activeTickets.length > 0 && !selectedTicket) {
                setSelectedTicket(activeTickets[0]);
            }

            const statsRes = await fetch(`/api/stats?user_id=${userId}`);
            const statsData = await statsRes.json();
            if (statsData.userStats) {
                setUserScore(statsData.userStats.score);
                setStats({
                    open: statsData.userStats.active,
                    resolved: statsData.userStats.closed,
                    total: statsData.userStats.assigned,
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoadingData(false);
        }
    }, [userId, selectedTicket]);

    useEffect(() => {
        if (userId) fetchData();
    }, [userId, fetchData]);

    const handleAddNote = async (note: string) => {
        if (!selectedTicket) return;
        try {
            const res = await fetch(`/api/tickets/${selectedTicket.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: note, user_id: userId }),
            });
            if (res.ok) toast.success('Note added!');
            fetchData();
        } catch {
            toast.error('Failed to add note');
        }
    };

    const handleMarkDone = async () => {
        if (!selectedTicket) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PENDING_REVIEW', user_id: userId }),
            });
            if (res.ok) toast.success('Ticket sent for review!');
            fetchData();
        } catch {
            toast.error('Failed to update ticket');
        }

        setIsLoading(false);
        setShowDoneModal(false);
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

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
                        <StatCard value={stats.open} label="Open Tickets" color="primary" bordered />
                        <StatCard value={stats.resolved} label="Resolved" color="green" />
                        <StatCard value={stats.total} label="Total Assigned" color="slate" />
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">My Tickets</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar p-1">
                            {isLoadingData ? (
                                <div className="flex items-center justify-center py-8">
                                    <span className="size-6 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                                    <p>No tickets assigned</p>
                                </div>
                            ) : (
                                tickets.map((ticket) => (
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
                                        accentColor="#10B981"
                                        onClick={() => setSelectedTicket(ticket)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-[450px] flex flex-col gap-4 min-w-0 overflow-hidden">
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                            <span className="material-symbols-outlined text-base">bolt</span>
                            Quick Actions
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
                                onClick={() => setShowDoneModal(true)}
                                disabled={!selectedTicket}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">task_alt</span>
                                Mark as Done
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-white rounded-[2rem] shadow-soft p-6 min-h-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                            <span className="material-symbols-outlined text-base">tips_and_updates</span>
                            Tips for Today
                        </div>
                        <div className="space-y-3">
                            <div className="bg-emerald-50 rounded-xl p-3">
                                <p className="text-sm text-emerald-700 font-medium">💡 Remember to add notes before marking as done!</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3">
                                <p className="text-sm text-blue-700 font-medium">📞 For technical issues, escalate to Senior CS first.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AddNoteModal
                isOpen={showNoteModal}
                onClose={() => setShowNoteModal(false)}
                onSubmit={handleAddNote}
                ticketNumber={selectedTicket?.number}
            />

            <ConfirmModal
                isOpen={showDoneModal}
                onClose={() => setShowDoneModal(false)}
                onConfirm={handleMarkDone}
                title="Mark as Done"
                message={`This will mark ticket #${selectedTicket?.number} as done and send it to Senior CS for review.`}
                confirmText="Mark Done"
                confirmColor="green"
                isLoading={isLoading}
            />
        </>
    );
}
