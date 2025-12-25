import StatCard from '@/components/dashboard/StatCard';

export default function AdminDashboardPage() {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">System overview and management</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Dec 25, 2024</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left Panel - Stats */}
                <div className="flex-[2] flex flex-col gap-6 min-w-0 h-full">
                    {/* System Stats */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] shadow-soft p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm font-semibold opacity-90">System Overview</p>
                                <p className="text-xs opacity-70">All time statistics</p>
                            </div>
                            <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full">December 2024</span>
                        </div>
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-extrabold">1,247</span>
                            <span className="text-2xl font-bold opacity-70 mb-1">tickets</span>
                        </div>
                        <p className="text-sm opacity-80 mt-2">📊 Total tickets processed this month</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        <StatCard value={156} label="Open Tickets" color="primary" bordered />
                        <StatCard value={89} label="In Progress" color="blue" />
                        <StatCard value={1002} label="Resolved" color="green" />
                        <StatCard value={12} label="With IT" color="amber" />
                    </div>

                    {/* Team Stats */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Team Performance</h2>
                        <div className="flex-1 bg-white rounded-[2rem] shadow-soft p-6 overflow-hidden">
                            <div className="h-full overflow-y-auto no-scrollbar space-y-4">
                                {/* Senior CS */}
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                    <div className="size-12 rounded-full bg-[#EB4C36]/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#EB4C36]">shield_person</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">Jay Won</p>
                                        <p className="text-xs text-slate-500">Senior CS Agent</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-900">95/100</p>
                                        <p className="text-xs text-green-500">Excellent</p>
                                    </div>
                                </div>

                                {/* Junior CS */}
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                    <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-emerald-500">person</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">Himari</p>
                                        <p className="text-xs text-slate-500">Junior CS Agent</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-900">72/100</p>
                                        <p className="text-xs text-amber-500">Needs Improvement</p>
                                    </div>
                                </div>

                                {/* IT Support */}
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                    <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-500">build</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">Budi Santoso</p>
                                        <p className="text-xs text-slate-500">IT Support Staff</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-900">24</p>
                                        <p className="text-xs text-slate-500">Resolved</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-[450px] flex flex-col gap-4 min-w-0 h-full overflow-hidden">
                    {/* Admin Actions */}
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                            Admin Actions
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-soft">
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                    <span className="material-symbols-outlined text-slate-600">person_add</span>
                                    <span className="text-xs font-medium text-slate-600">Add User</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                    <span className="material-symbols-outlined text-slate-600">analytics</span>
                                    <span className="text-xs font-medium text-slate-600">Reports</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                    <span className="material-symbols-outlined text-slate-600">settings</span>
                                    <span className="text-xs font-medium text-slate-600">Settings</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                    <span className="material-symbols-outlined text-slate-600">security</span>
                                    <span className="text-xs font-medium text-slate-600">Audit</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="flex-1 bg-white rounded-[2rem] shadow-soft flex flex-col overflow-hidden min-h-0">
                        <div className="p-6 pb-4 bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-slate-400 text-lg">history</span>
                                System Activity
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar space-y-3">
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-900">New <span className="font-bold text-red-500">HIGH</span> priority ticket <span className="font-mono text-red-500">#8821</span></p>
                                <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-900">Ticket <span className="font-mono">#8817</span> closed by Jay Won</p>
                                <p className="text-[10px] text-slate-400 mt-1">3 hours ago</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-900">Ticket <span className="font-mono">#8819</span> escalated to IT</p>
                                <p className="text-[10px] text-slate-400 mt-1">4 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
