import ScoreCard from '@/components/dashboard/ScoreCard';
import StatCard from '@/components/dashboard/StatCard';
import TicketCard from '@/components/dashboard/TicketCard';

const mockTickets = [
    {
        ticketNumber: '8820',
        subject: 'Invoice discrepancy for November',
        description: 'Customer asking about charges from last month.',
        priority: 'MEDIUM' as const,
        status: 'IN_PROGRESS' as const,
        customerName: 'CV. Maju Bersama',
        customerInitials: 'MB',
        timeAgo: '1h ago',
        assignedBy: 'Jay Won',
    },
    {
        ticketNumber: '8818',
        subject: 'Password reset request',
        description: 'Need help resetting account password.',
        priority: 'LOW' as const,
        status: 'OPEN' as const,
        customerName: 'Ahmad Fauzi',
        customerInitials: 'AF',
        timeAgo: '2h ago',
        assignedBy: 'Jay Won',
    },
];

export default function JuniorDashboardPage() {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, Himari! 👋</h1>
                    <p className="text-sm text-slate-500 mt-1">Here&apos;s your performance summary</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Dec 25, 2024</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left Column */}
                <div className="flex-[1.2] flex flex-col gap-6 overflow-hidden">
                    {/* Score Card */}
                    <ScoreCard
                        role="junior"
                        userName="Himari"
                        score={72}
                        message="⚠️ Perlu ditingkatkan - 28 poin berkurang bulan ini."
                    />

                    {/* Stats Row */}
                    <div className="flex gap-4">
                        <StatCard value={5} label="Open Tickets" color="primary" bordered />
                        <StatCard value={3} label="Resolved Today" color="green" />
                        <StatCard value={32} label="Total This Month" color="slate" />
                    </div>

                    {/* My Tickets */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">My Tickets</h2>
                            <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                                <span className="material-symbols-outlined text-lg">sort</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                            {mockTickets.map((ticket) => (
                                <TicketCard key={ticket.ticketNumber} {...ticket} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-[450px] flex flex-col gap-4 min-w-0 h-full overflow-hidden">
                    {/* Junior Actions */}
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                            <span className="material-symbols-outlined text-base">bolt</span>
                            Actions
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-soft flex flex-col gap-3">
                            <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors">
                                <span className="material-symbols-outlined">edit_note</span>
                                Add Note
                            </button>
                            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-emerald-500/30">
                                <span className="material-symbols-outlined">check_circle</span>
                                Mark as Done (Request Review)
                            </button>
                            <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed">
                                <span className="material-symbols-outlined">lock</span>
                                Close Ticket (Senior Only)
                            </button>
                        </div>
                    </div>

                    {/* Ticket Info + Activity */}
                    <div className="flex-1 bg-white rounded-[2rem] shadow-soft flex flex-col overflow-hidden min-h-0">
                        <div className="p-6 pb-4 bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                                <span className="material-symbols-outlined text-slate-400 text-lg">info</span>
                                Ticket Info + My Activity
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
                            <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                <p className="text-xs text-slate-400 font-medium">Currently Working On</p>
                                <p className="text-sm font-bold text-slate-900 mt-1">#8820 - Invoice discrepancy</p>
                                <p className="text-xs text-slate-500 mt-1">CV. Maju Bersama</p>
                            </div>

                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</p>
                            <div className="space-y-3">
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-slate-500">Started working on #8820</p>
                                    <p className="text-[10px] text-slate-400 mt-1">30 minutes ago</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-slate-500">Resolved #8817</p>
                                    <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
