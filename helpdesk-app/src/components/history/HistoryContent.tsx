'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import CustomSelect from '@/components/ui/CustomSelect';

interface HistoryItem {
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    resolvedBy: string;
    closedAt: string;
}

export default function HistoryContent() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchHistory();
    }, [filter]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            // Fetch both closed and resolved tickets
            const [closedRes, resolvedRes] = await Promise.all([
                fetch('/api/tickets?status=CLOSED&limit=100'),
                fetch('/api/tickets?status=RESOLVED&limit=100')
            ]);

            const closedData = await closedRes.json();
            const resolvedData = await resolvedRes.json();

            // Combine both arrays
            const allTickets = [
                ...(closedData.tickets || []),
                ...(resolvedData.tickets || [])
            ];

            if (allTickets.length > 0) {
                // Filter by date if needed
                let filtered = allTickets;
                const now = new Date();

                if (filter === 'week') {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    filtered = filtered.filter((t: any) => new Date(t.closed_at || t.updated_at) >= weekAgo);
                } else if (filter === 'month') {
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    filtered = filtered.filter((t: any) => new Date(t.closed_at || t.updated_at) >= monthStart);
                }

                // Sort by date descending
                filtered.sort((a: any, b: any) => {
                    const dateA = new Date(a.closed_at || a.updated_at).getTime();
                    const dateB = new Date(b.closed_at || b.updated_at).getTime();
                    return dateB - dateA;
                });

                const historyItems: HistoryItem[] = filtered.map((ticket: any) => ({
                    id: ticket.id,
                    ticketNumber: ticket.number,
                    subject: ticket.subject,
                    status: ticket.status,
                    resolvedBy: ticket.assigned_to?.name || 'Unknown',
                    closedAt: ticket.closed_at
                        ? new Date(ticket.closed_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                        })
                        : ticket.updated_at
                            ? new Date(ticket.updated_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                            })
                            : '-',
                }));

                setHistory(historyItems);
            } else {
                setHistory([]);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            toast.error('Failed to load history');
        } finally {
            setIsLoading(false);
        }
    };

    // Client-side search filtering
    const filteredHistory = history.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            item.ticketNumber.toLowerCase().includes(query) ||
            item.subject.toLowerCase().includes(query) ||
            item.resolvedBy.toLowerCase().includes(query)
        );
    });

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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white rounded-full shadow-soft text-sm w-64 focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none"
                        />
                    </div>
                    <CustomSelect
                        value={filter}
                        onChange={setFilter}
                        options={[
                            { value: 'all', label: 'All Time' },
                            { value: 'week', label: 'This Week' },
                            { value: 'month', label: 'This Month' },
                        ]}
                        variant="filter"
                    />
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
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <span className="size-8 border-2 border-slate-200 border-t-[#EB4C36] rounded-full animate-spin" />
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-slate-400">
                            No closed tickets found
                        </div>
                    ) : (
                        filteredHistory.map((item) => (
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
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing {filteredHistory.length} closed ticket{filteredHistory.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        </>
    );
}
