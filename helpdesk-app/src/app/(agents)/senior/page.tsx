import ScoreCard from '@/components/dashboard/ScoreCard';
import StatCard from '@/components/dashboard/StatCard';
import TicketCard from '@/components/dashboard/TicketCard';

// Mock data - in production, this would come from database
const mockTickets = [
    {
        ticketNumber: '8821',
        subject: 'GPS device offline for 3 hours',
        description: 'Customer reports that their GPS tracker has been offline since 10 AM.',
        priority: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        customerName: 'PT. Trans Logistics',
        customerInitials: 'TL',
        timeAgo: '30m ago',
    },
    {
        ticketNumber: '8820',
        subject: 'Invoice discrepancy for November',
        description: 'Questions about invoice charges from last month.',
        priority: 'MEDIUM' as const,
        status: 'OPEN' as const,
        customerName: 'CV. Maju Bersama',
        customerInitials: 'MB',
        timeAgo: '1h ago',
    },
    {
        ticketNumber: '8819',
        subject: 'Server authentication error 500',
        description: 'Unable to login to the mobile app.',
        priority: 'HIGH' as const,
        status: 'WITH_IT' as const,
        customerName: 'PT. Digital Solusi',
        customerInitials: 'DS',
        timeAgo: '2h ago',
    },
];

export default function SeniorDashboardPage() {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, Jay Won! 👋</h1>
                    <p className="text-sm text-slate-500 mt-1">Here&apos;s your performance summary</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Dec 25, 2024</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left Panel */}
                <div className="flex-[2] flex flex-col gap-6 min-w-0 h-full">
                    {/* Score Card */}
                    <ScoreCard
                        role="senior"
                        userName="Jay Won"
                        score={95}
                        message="🎯 Great job! You're on track this month."
                    />

                    {/* Stats Row */}
                    <div className="flex gap-4">
                        <StatCard value={2} label="High Priority" color="red" bordered />
                        <StatCard value={5} label="Medium" color="amber" />
                        <StatCard value={10} label="Low" color="blue" />
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
                            {mockTickets.map((ticket) => (
                                <TicketCard key={ticket.ticketNumber} {...ticket} />
                            ))}
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
                            <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors">
                                <span className="material-symbols-outlined">edit_note</span>
                                Add Note
                            </button>
                            <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors">
                                <span className="material-symbols-outlined">engineering</span>
                                Assign to IT Support
                            </button>
                            <button className="w-full bg-green-50 hover:bg-green-100 text-green-600 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors">
                                <span className="material-symbols-outlined">check_circle</span>
                                Mark as Resolved
                            </button>
                            <button className="w-full bg-[#EB4C36] hover:bg-[#d13a25] text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#EB4C36]/30">
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
                                {/* Timeline items would go here */}
                                <div className="relative group">
                                    <div className="absolute -left-4 top-0 size-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-green-600">Resolved</span>
                                            <span className="text-[10px] text-slate-400">10:30 AM</span>
                                        </div>
                                        <p className="text-sm text-slate-600">Ticket #8818 closed by Jay Won</p>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <div className="absolute -left-4 top-0 size-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-blue-600">Assigned</span>
                                            <span className="text-[10px] text-slate-400">09:15 AM</span>
                                        </div>
                                        <p className="text-sm text-slate-600">Ticket #8819 escalated to IT</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
