export default function SeniorReportsPage() {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">Performance and activity reports</p>
                </div>
                <div className="flex items-center gap-3">
                    <select className="px-4 py-2.5 bg-white rounded-full shadow-soft text-sm font-medium">
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>Last 3 Months</option>
                    </select>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EB4C36] text-white rounded-full font-bold text-sm shadow-lg shadow-[#EB4C36]/30">
                        <span className="material-symbols-outlined text-lg">download</span>
                        Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-sm text-slate-500">Tickets Handled</p>
                    <p className="text-4xl font-extrabold text-slate-900 mt-2">156</p>
                    <p className="text-xs text-green-500 mt-1">↑ 12% from last month</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-sm text-slate-500">Avg Resolution Time</p>
                    <p className="text-4xl font-extrabold text-slate-900 mt-2">2.4h</p>
                    <p className="text-xs text-green-500 mt-1">↓ 15% from last month</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-sm text-slate-500">Customer Satisfaction</p>
                    <p className="text-4xl font-extrabold text-slate-900 mt-2">94%</p>
                    <p className="text-xs text-green-500 mt-1">↑ 3% from last month</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-sm text-slate-500">Performance Score</p>
                    <p className="text-4xl font-extrabold text-[#EB4C36] mt-2">95</p>
                    <p className="text-xs text-slate-400 mt-1">out of 100</p>
                </div>
            </div>

            {/* Charts Placeholder */}
            <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
                <div className="bg-white rounded-[2rem] shadow-soft p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Tickets Over Time</h3>
                    <div className="h-64 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        Chart placeholder - will be implemented with chart library
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] shadow-soft p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Tickets by Priority</h3>
                    <div className="h-64 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        Chart placeholder - will be implemented with chart library
                    </div>
                </div>
            </div>
        </>
    );
}
