'use client';

import { useState } from 'react';

const mockHistory = [
    { id: '1', ticketNumber: '8817', subject: 'Password reset request', status: 'CLOSED', resolvedBy: 'Himari', closedAt: 'Dec 24, 2024 16:30' },
    { id: '2', ticketNumber: '8816', subject: 'Vehicle not moving on map display', status: 'CLOSED', resolvedBy: 'Jay Won', closedAt: 'Dec 24, 2024 14:30' },
    { id: '3', ticketNumber: '8814', subject: 'Cannot access dashboard', status: 'CLOSED', resolvedBy: 'Budi Santoso', closedAt: 'Dec 23, 2024 16:00' },
    { id: '4', ticketNumber: '8812', subject: 'Billing inquiry', status: 'CLOSED', resolvedBy: 'Himari', closedAt: 'Dec 23, 2024 11:20' },
    { id: '5', ticketNumber: '8810', subject: 'GPS device setup help', status: 'CLOSED', resolvedBy: 'Jay Won', closedAt: 'Dec 22, 2024 15:45' },
];

export default function HistoryContent() {
    const [filter, setFilter] = useState('all');

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ticket History</h1>
                    <p className="text-sm text-slate-500 mt-1">View closed and resolved tickets</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search history..."
                            className="pl-10 pr-4 py-2.5 bg-white rounded-full shadow-soft text-sm w-64 focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white rounded-full shadow-soft text-sm font-medium"
                    >
                        <option value="all">All Time</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
            </div>

            {/* History Table */}
            <div className="flex-1 bg-white rounded-[2rem] shadow-soft overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-400 uppercase">
                    <div className="w-24">Ticket</div>
                    <div className="flex-1">Subject</div>
                    <div className="w-28">Status</div>
                    <div className="w-32">Resolved By</div>
                    <div className="w-40">Closed At</div>
                    <div className="w-20 text-right">View</div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-50">
                    {mockHistory.map((item) => (
                        <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50">
                            <div className="w-24 text-xs font-mono font-bold text-slate-400">#{item.ticketNumber}</div>
                            <div className="flex-1 text-sm font-semibold text-slate-900">{item.subject}</div>
                            <div className="w-28">
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                    {item.status}
                                </span>
                            </div>
                            <div className="w-32 text-sm text-slate-600">{item.resolvedBy}</div>
                            <div className="w-40 text-xs text-slate-500">{item.closedAt}</div>
                            <div className="w-20 flex justify-end">
                                <button className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                                    <span className="material-symbols-outlined text-base">visibility</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Showing 1-5 of 1,089 closed tickets</p>
                    <div className="flex items-center gap-2">
                        <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <button className="size-8 rounded-full bg-[#EB4C36] text-white flex items-center justify-center font-bold text-sm">1</button>
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
