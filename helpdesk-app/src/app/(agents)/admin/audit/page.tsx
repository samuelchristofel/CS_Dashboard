'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Activity {
    id: string;
    action: string;
    details: string | null;
    created_at: string;
    user: {
        id: string;
        name: string;
        role: string;
        avatar?: string;
    } | null;
    ticket: {
        id: string;
        number: string;
        subject: string;
    } | null;
}

const actionColors: Record<string, string> = {
    'TICKET_CREATED': 'bg-purple-50 text-purple-600',
    'TICKET_ASSIGNED': 'bg-blue-50 text-blue-600',
    'TICKET_UPDATED': 'bg-slate-100 text-slate-600',
    'TICKET_RESOLVED': 'bg-green-50 text-green-600',
    'TICKET_CLOSED': 'bg-slate-100 text-slate-600',
    'TICKET_ESCALATED': 'bg-amber-50 text-amber-600',
    'NOTE_ADDED': 'bg-indigo-50 text-indigo-600',
    'USER_LOGIN': 'bg-green-50 text-green-600',
    'USER_LOGOUT': 'bg-slate-100 text-slate-600',
};

const actionLabels: Record<string, string> = {
    'TICKET_CREATED': 'Ticket Created',
    'TICKET_ASSIGNED': 'Ticket Assigned',
    'TICKET_UPDATED': 'Ticket Updated',
    'TICKET_RESOLVED': 'Ticket Resolved',
    'TICKET_CLOSED': 'Ticket Closed',
    'TICKET_ESCALATED': 'Ticket Escalated',
    'NOTE_ADDED': 'Note Added',
    'USER_LOGIN': 'User Login',
    'USER_LOGOUT': 'User Logout',
};

const roleLabels: Record<string, string> = {
    'admin': 'Admin',
    'senior': 'Senior CS',
    'junior': 'Junior CS',
    'it': 'IT Support',
};

export default function AdminAuditPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('today');

    useEffect(() => {
        fetchActivities();
    }, [actionFilter, dateFilter]);

    const fetchActivities = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/activities?limit=100');
            const data = await res.json();

            if (data.activities) {
                let filtered = data.activities;
                const now = new Date();

                // Filter by date
                if (dateFilter === 'today') {
                    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    filtered = filtered.filter((a: Activity) => new Date(a.created_at) >= todayStart);
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    filtered = filtered.filter((a: Activity) => new Date(a.created_at) >= weekAgo);
                } else if (dateFilter === 'month') {
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    filtered = filtered.filter((a: Activity) => new Date(a.created_at) >= monthAgo);
                }

                // Filter by action type
                if (actionFilter !== 'all') {
                    if (actionFilter === 'login') {
                        filtered = filtered.filter((a: Activity) => a.action.includes('LOGIN') || a.action.includes('LOGOUT'));
                    } else if (actionFilter === 'ticket') {
                        filtered = filtered.filter((a: Activity) => a.action.includes('TICKET'));
                    } else if (actionFilter === 'admin') {
                        filtered = filtered.filter((a: Activity) =>
                            a.action.includes('USER') || a.action.includes('PASSWORD') || a.action.includes('ADMIN')
                        );
                    }
                }

                setActivities(filtered);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast.error('Failed to load audit logs');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
                    <p className="text-sm text-slate-500 mt-1">System activity and security logs</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white rounded-full shadow-soft text-sm font-medium"
                    >
                        <option value="all">All Actions</option>
                        <option value="login">User Login</option>
                        <option value="ticket">Ticket Actions</option>
                        <option value="admin">Admin Actions</option>
                    </select>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white rounded-full shadow-soft text-sm font-medium"
                    >
                        <option value="today">Today</option>
                        <option value="week">Last 7 days</option>
                        <option value="month">Last 30 days</option>
                        <option value="all">All Time</option>
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
                    <div className="w-48">Timestamp</div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <span className="size-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-slate-400">
                            No activity logs found
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="px-6 py-4 border-b border-slate-50 flex items-center gap-4 hover:bg-slate-50">
                                <div className="w-32">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${actionColors[activity.action] || 'bg-slate-100 text-slate-600'}`}>
                                        {actionLabels[activity.action] || activity.action}
                                    </span>
                                </div>
                                <div className="w-32 text-sm font-semibold text-slate-900">
                                    {activity.user?.name || 'System'}
                                </div>
                                <div className="w-24 text-xs text-slate-500">
                                    {activity.user ? roleLabels[activity.user.role] || activity.user.role : 'API'}
                                </div>
                                <div className="flex-1 text-sm text-slate-600">
                                    {activity.details || (activity.ticket ? `Ticket #${activity.ticket.number}` : '-')}
                                </div>
                                <div className="w-48 text-xs text-slate-500 font-mono">
                                    {formatTimestamp(activity.created_at)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing {activities.length} log{activities.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        </>
    );
}
