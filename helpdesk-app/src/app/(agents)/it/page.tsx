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

export default function ITDashboardPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [stats, setStats] = useState({ assigned: 0, pending: 0, resolved: 0 });
    const [userScore, setUserScore] = useState(0);

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showFixedModal, setShowFixedModal] = useState(false);
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
            // Fetch tickets with IT status or assigned to IT user
            const ticketsRes = await fetch(`/api/tickets?status=WITH_IT`);
            const ticketsData = await ticketsRes.json();

            const myTickets = (ticketsData.tickets || []).filter(
                (t: { assigned_to_id?: string; status: string }) =>
                    t.assigned_to_id === userId || t.status === 'WITH_IT'
            );
            setTickets(myTickets);
            if (myTickets.length > 0 && !selectedTicket) {
                setSelectedTicket(myTickets[0]);
            }

            const statsRes = await fetch(`/api/stats?user_id=${userId}`);
            const statsData = await statsRes.json();
            if (statsData.userStats) {
                setUserScore(statsData.userStats.closed);
                setStats({
                    assigned: statsData.userStats.active,
                    pending: myTickets.filter((t: { status: string }) => t.status === 'WITH_IT').length,
                    resolved: statsData.userStats.closed,
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
            if (res.ok) toast.success('Technical note added!');
            fetchData();
        } catch {
            toast.error('Failed to add note');
        }
    };

    const handleMarkFixed = async () => {
        if (!selectedTicket) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'RESOLVED', user_id: userId }),
            });
            if (res.ok) toast.success('Ticket marked as fixed!');
            fetchData();
        } catch {
            toast.error('Failed to update ticket');
        }

        setIsLoading(false);
        setShowFixedModal(false);
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
                        role="it"
                        userName={userName}
                        score={userScore}
                        message="🔧 Technical tickets resolved this month"
                    />

                    <div className="flex gap-4">
                        <StatCard value={stats.assigned} label="Assigned to Me" color="primary" bordered />
                        <StatCard value={stats.pending} label="Pending" color="amber" />
                        <StatCard value={stats.resolved} label="Fixed This Month" color="green" />
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Technical Tickets</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                            {isLoadingData ? (
                                <div className="flex items-center justify-center py-8">
                                    <span className="size-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">engineering</span>
                                    <p>No technical tickets</p>
                                </div>
                            ) : (
                                tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`cursor-pointer ${selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''} rounded-2xl`}
                                    >
                                        <TicketCard
                                            ticketNumber={ticket.number}
                                            subject={ticket.subject}
                                            description={ticket.description || ''}
                                            priority={ticket.priority}
                                            status={ticket.status as 'WITH_IT' | 'IN_PROGRESS'}
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

                <div className="w-[450px] flex flex-col gap-4 min-w-0 overflow-hidden">
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                            <span className="material-symbols-outlined text-base">bolt</span>
                            IT Actions
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-soft flex flex-col gap-3">
                            <button
                                onClick={() => setShowNoteModal(true)}
                                disabled={!selectedTicket}
                                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">edit_note</span>
                                Add Technical Note
                            </button>
                            <button
                                onClick={() => setShowFixedModal(true)}
                                disabled={!selectedTicket}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">build</span>
                                Mark as Fixed
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-white rounded-[2rem] shadow-soft p-6 min-h-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                            <span className="material-symbols-outlined text-base">terminal</span>
                            System Status
                        </div>
                        <div className="space-y-3">
                            <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
                                <span className="size-3 rounded-full bg-green-500"></span>
                                <p className="text-sm text-green-700 font-medium">All systems operational</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-500">Last checked: {new Date().toLocaleTimeString()}</p>
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
                isOpen={showFixedModal}
                onClose={() => setShowFixedModal(false)}
                onConfirm={handleMarkFixed}
                title="Mark as Fixed"
                message={`This will mark ticket #${selectedTicket?.number} as fixed and return it to Customer Service for closure.`}
                confirmText="Mark Fixed"
                confirmColor="blue"
                isLoading={isLoading}
            />
        </>
    );
}
