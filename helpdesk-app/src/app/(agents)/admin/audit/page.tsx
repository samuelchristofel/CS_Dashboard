const mockLogs = [
    { id: '1', action: 'User Login', user: 'Jay Won', role: 'Senior CS', timestamp: 'Dec 25, 2024 14:30:22', ip: '192.168.1.***' },
    { id: '2', action: 'Ticket Closed', user: 'Jay Won', role: 'Senior CS', timestamp: 'Dec 25, 2024 14:25:10', ip: '192.168.1.***', details: 'Ticket #8817' },
    { id: '3', action: 'Ticket Assigned', user: 'Jay Won', role: 'Senior CS', timestamp: 'Dec 25, 2024 14:20:45', ip: '192.168.1.***', details: '#8821 → IT Support' },
    { id: '4', action: 'User Login', user: 'Himari', role: 'Junior CS', timestamp: 'Dec 25, 2024 14:15:30', ip: '192.168.1.***' },
    { id: '5', action: 'Ticket Created', user: 'System', role: 'API', timestamp: 'Dec 25, 2024 13:45:00', ip: 'Freshchat', details: 'Ticket #8821' },
    { id: '6', action: 'User Login', user: 'Budi Santoso', role: 'IT Support', timestamp: 'Dec 25, 2024 13:30:00', ip: '192.168.1.***' },
    { id: '7', action: 'Password Reset', user: 'Admin', role: 'Super Admin', timestamp: 'Dec 25, 2024 10:00:00', ip: '192.168.1.***', details: 'For user: andi@helpdesk.com' },
];

const actionColors: Record<string, string> = {
    'User Login': 'bg-green-50 text-green-600',
    'Ticket Closed': 'bg-slate-100 text-slate-600',
    'Ticket Assigned': 'bg-blue-50 text-blue-600',
    'Ticket Created': 'bg-purple-50 text-purple-600',
    'Password Reset': 'bg-amber-50 text-amber-600',
};

export default function AdminAuditPage() {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
                    <p className="text-sm text-slate-500 mt-1">System activity and security logs</p>
                </div>
                <div className="flex items-center gap-3">
                    <select className="px-4 py-2.5 bg-white rounded-full shadow-soft text-sm font-medium">
                        <option>All Actions</option>
                        <option>User Login</option>
                        <option>Ticket Actions</option>
                        <option>Admin Actions</option>
                    </select>
                    <select className="px-4 py-2.5 bg-white rounded-full shadow-soft text-sm font-medium">
                        <option>Today</option>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                    </select>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-full font-bold text-sm shadow-lg">
                        <span className="material-symbols-outlined text-lg">download</span>
                        Export
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="flex-1 bg-white rounded-[2rem] shadow-soft overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-400 uppercase">
                    <div className="w-32">Action</div>
                    <div className="w-32">User</div>
                    <div className="w-24">Role</div>
                    <div className="flex-1">Details</div>
                    <div className="w-40">Timestamp</div>
                    <div className="w-28">IP Address</div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {mockLogs.map((log) => (
                        <div key={log.id} className="px-6 py-4 border-b border-slate-50 flex items-center gap-4 hover:bg-slate-50">
                            <div className="w-32">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${actionColors[log.action] || 'bg-slate-100 text-slate-600'}`}>
                                    {log.action}
                                </span>
                            </div>
                            <div className="w-32 text-sm font-semibold text-slate-900">{log.user}</div>
                            <div className="w-24 text-xs text-slate-500">{log.role}</div>
                            <div className="flex-1 text-sm text-slate-600">{log.details || '-'}</div>
                            <div className="w-40 text-xs text-slate-500 font-mono">{log.timestamp}</div>
                            <div className="w-28 text-xs text-slate-400 font-mono">{log.ip}</div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Showing 1-7 of 1,234 logs</p>
                    <div className="flex items-center gap-2">
                        <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <button className="size-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">1</button>
                        <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-medium text-sm">2</button>
                        <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
