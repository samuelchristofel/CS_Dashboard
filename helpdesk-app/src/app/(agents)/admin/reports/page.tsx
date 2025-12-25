export default function AdminReportsPage() {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">Company-wide performance metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <select className="px-4 py-2.5 bg-white rounded-full shadow-soft text-sm font-medium">
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>This Quarter</option>
                        <option>This Year</option>
                    </select>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-full font-bold text-sm shadow-lg">
                        <span className="material-symbols-outlined text-lg">download</span>
                        Export Report
                    </button>
                </div>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-sm text-slate-500">Total Tickets</p>
                    <p className="text-4xl font-extrabold text-slate-900 mt-2">1,247</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-sm text-slate-500">Resolved</p>
                    <p className="text-4xl font-extrabold text-green-500 mt-2">1,089</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-sm text-slate-500">Open</p>
                    <p className="text-4xl font-extrabold text-amber-500 mt-2">158</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-sm text-slate-500">Avg Resolution</p>
                    <p className="text-4xl font-extrabold text-blue-500 mt-2">3.2h</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                    <p className="text-sm text-slate-500">Satisfaction</p>
                    <p className="text-4xl font-extrabold text-slate-900 mt-2">92%</p>
                </div>
            </div>

            {/* Team Performance */}
            <div className="flex-1 bg-white rounded-[2rem] shadow-soft p-6 overflow-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Team Performance</h3>
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                            <th className="pb-3">Agent</th>
                            <th className="pb-3">Role</th>
                            <th className="pb-3">Tickets</th>
                            <th className="pb-3">Resolved</th>
                            <th className="pb-3">Avg Time</th>
                            <th className="pb-3">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        <tr className="hover:bg-slate-50">
                            <td className="py-4 text-sm font-semibold text-slate-900">Jay Won</td>
                            <td className="py-4 text-sm text-slate-500">Senior CS</td>
                            <td className="py-4 text-sm text-slate-900">423</td>
                            <td className="py-4 text-sm text-green-500">412</td>
                            <td className="py-4 text-sm text-slate-900">1.8h</td>
                            <td className="py-4"><span className="text-sm font-bold text-green-500">95</span></td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                            <td className="py-4 text-sm font-semibold text-slate-900">Himari</td>
                            <td className="py-4 text-sm text-slate-500">Junior CS</td>
                            <td className="py-4 text-sm text-slate-900">312</td>
                            <td className="py-4 text-sm text-green-500">280</td>
                            <td className="py-4 text-sm text-slate-900">2.5h</td>
                            <td className="py-4"><span className="text-sm font-bold text-amber-500">72</span></td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                            <td className="py-4 text-sm font-semibold text-slate-900">Andi R.</td>
                            <td className="py-4 text-sm text-slate-500">Junior CS</td>
                            <td className="py-4 text-sm text-slate-900">245</td>
                            <td className="py-4 text-sm text-green-500">238</td>
                            <td className="py-4 text-sm text-slate-900">2.1h</td>
                            <td className="py-4"><span className="text-sm font-bold text-green-500">88</span></td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                            <td className="py-4 text-sm font-semibold text-slate-900">Budi Santoso</td>
                            <td className="py-4 text-sm text-slate-500">IT Support</td>
                            <td className="py-4 text-sm text-slate-900">89</td>
                            <td className="py-4 text-sm text-green-500">85</td>
                            <td className="py-4 text-sm text-slate-900">45m</td>
                            <td className="py-4"><span className="text-sm font-bold text-slate-500">-</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}
