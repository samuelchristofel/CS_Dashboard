export default function AdminAnalyticsPage() {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">Deep dive into system metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <select className="px-4 py-2.5 bg-white rounded-full shadow-soft text-sm font-medium">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#EB4C36] to-[#d13a25] rounded-2xl p-6 text-white">
                    <p className="text-sm opacity-80">First Response Time</p>
                    <p className="text-4xl font-extrabold mt-2">12m</p>
                    <p className="text-xs opacity-60 mt-1">Target: 15m</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <p className="text-sm opacity-80">Resolution Rate</p>
                    <p className="text-4xl font-extrabold mt-2">87%</p>
                    <p className="text-xs opacity-60 mt-1">Target: 85%</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
                    <p className="text-sm opacity-80">CSAT Score</p>
                    <p className="text-4xl font-extrabold mt-2">4.6</p>
                    <p className="text-xs opacity-60 mt-1">out of 5.0</p>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white">
                    <p className="text-sm opacity-80">Tickets per Day</p>
                    <p className="text-4xl font-extrabold mt-2">42</p>
                    <p className="text-xs opacity-60 mt-1">↑ 8% trend</p>
                </div>
            </div>

            {/* Charts */}
            <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
                <div className="bg-white rounded-[2rem] shadow-soft p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Ticket Volume Trend</h3>
                    <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        Line chart placeholder
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] shadow-soft p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Resolution Time Distribution</h3>
                    <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        Bar chart placeholder
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] shadow-soft p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Tickets by Category</h3>
                    <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        Pie chart placeholder
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] shadow-soft p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Peak Hours</h3>
                    <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        Heatmap placeholder
                    </div>
                </div>
            </div>
        </>
    );
}
