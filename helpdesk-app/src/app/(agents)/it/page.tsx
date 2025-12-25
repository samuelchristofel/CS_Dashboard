import ScoreCard from '@/components/dashboard/ScoreCard';
import StatCard from '@/components/dashboard/StatCard';
import TicketCard from '@/components/dashboard/TicketCard';

const mockTickets = [
    {
        ticketNumber: '8821',
        subject: 'GPS device offline for 3 hours',
        description: 'Hardware issue suspected - needs physical inspection.',
        priority: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        customerName: 'PT. Trans Logistics',
        customerInitials: 'TL',
        timeAgo: '30m ago',
    },
    {
        ticketNumber: '8819',
        subject: 'Server authentication error 500',
        description: 'JWT token expiry issue - backend API.',
        priority: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        customerName: 'PT. Digital Solusi',
        customerInitials: 'DS',
        timeAgo: '2h ago',
    },
];

export default function ITDashboardPage() {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, Budi! 👋</h1>
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
                        role="it"
                        userName="Budi"
                        score={24}
                        message="🔧 Avg resolution time: 45 min"
                    />

                    {/* Stats Row */}
                    <div className="flex gap-4">
                        <StatCard value={2} label="Assigned to Me" color="primary" bordered />
                        <StatCard value={1} label="Pending CS" color="amber" />
                        <StatCard value={24} label="Resolved This Month" color="green" />
                    </div>

                    {/* Active Tickets */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Technical Tickets</h2>
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
                    {/* IT Actions */}
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                            <span className="material-symbols-outlined text-base">build</span>
                            Technical Actions
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-soft flex flex-col gap-3">
                            <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors">
                                <span className="material-symbols-outlined">description</span>
                                Add Technical Note
                            </button>
                            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-500/30">
                                <span className="material-symbols-outlined">check_circle</span>
                                Mark as Fixed (Return to CS)
                            </button>
                            <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed">
                                <span className="material-symbols-outlined">lock</span>
                                Close Ticket (CS Only)
                            </button>
                        </div>
                    </div>

                    {/* Technical Details */}
                    <div className="flex-1 bg-white rounded-[2rem] shadow-soft flex flex-col overflow-hidden min-h-0">
                        <div className="p-6 pb-4 bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                                <span className="material-symbols-outlined text-slate-400 text-lg">terminal</span>
                                Technical Details
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
                            <div className="bg-blue-50 rounded-xl p-4 mb-4">
                                <p className="text-xs text-blue-600 font-medium">Currently Investigating</p>
                                <p className="text-sm font-bold text-slate-900 mt-1">#8821 - GPS device offline</p>
                                <p className="text-xs text-slate-500 mt-1">Hardware issue suspected</p>
                            </div>

                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Diagnostic Log</p>
                            <div className="space-y-3">
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-slate-500">Ran ping test - device unresponsive</p>
                                    <p className="text-[10px] text-slate-400 mt-1">15 minutes ago</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs text-slate-500">Checked server logs - no errors</p>
                                    <p className="text-[10px] text-slate-400 mt-1">20 minutes ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
