'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Stats {
    total: number;
    open: number;
    inProgress: number;
    pendingReview: number;
    withIT: number;
    resolved: number;
    closed: number;
    high: number;
    medium: number;
    low: number;
}

interface TeamStats {
    totalResolved: number;
    avgResolutionTime: string;
    overallScore: number;
    totalAgents: number;
}

export default function AdminAnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch overall stats
            const statsRes = await fetch('/api/stats');
            const statsData = await statsRes.json();
            if (statsData.stats) {
                setStats(statsData.stats);
            }

            // Fetch performance data for team stats
            const perfRes = await fetch(`/api/performance?period=${period}`);
            const perfData = await perfRes.json();
            if (perfData.teamStats) {
                setTeamStats(perfData.teamStats);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate resolution rate
    const resolutionRate = stats
        ? Math.round(((stats.resolved + stats.closed) / Math.max(1, stats.total)) * 100)
        : 0;

    // Calculate tickets per day (assuming 30 days in month)
    const ticketsPerDay = stats ? Math.round(stats.total / 30) : 0;

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">Deep dive into system metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2.5 bg-white rounded-full shadow-soft text-sm font-medium"
                    >
                        <option value="week">Last 7 days</option>
                        <option value="month">Last 30 days</option>
                        <option value="quarter">Last 90 days</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="size-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-[#EB4C36] to-[#d13a25] rounded-2xl p-6 text-white">
                            <p className="text-sm opacity-80">Avg Resolution Time</p>
                            <p className="text-4xl font-extrabold mt-2">{teamStats?.avgResolutionTime || '-'}</p>
                            <p className="text-xs opacity-60 mt-1">Target: 24h</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                            <p className="text-sm opacity-80">Resolution Rate</p>
                            <p className="text-4xl font-extrabold mt-2">{resolutionRate}%</p>
                            <p className="text-xs opacity-60 mt-1">Target: 85%</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
                            <p className="text-sm opacity-80">Team Score</p>
                            <p className="text-4xl font-extrabold mt-2">{teamStats?.overallScore || 0}</p>
                            <p className="text-xs opacity-60 mt-1">out of 100</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white">
                            <p className="text-sm opacity-80">Tickets per Day</p>
                            <p className="text-4xl font-extrabold mt-2">{ticketsPerDay}</p>
                            <p className="text-xs opacity-60 mt-1">{stats?.total || 0} total</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
                        {/* Ticket Status Distribution */}
                        <div className="bg-white rounded-[2rem] shadow-soft p-6 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Ticket Status Distribution</h3>
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-24 text-sm text-slate-600">Open</div>
                                    <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full flex items-center justify-end pr-3"
                                            style={{ width: `${Math.max(5, (stats?.open || 0) / Math.max(1, stats?.total || 1) * 100)}%` }}
                                        >
                                            <span className="text-xs font-bold text-white">{stats?.open || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 text-sm text-slate-600">In Progress</div>
                                    <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-400 rounded-full flex items-center justify-end pr-3"
                                            style={{ width: `${Math.max(5, (stats?.inProgress || 0) / Math.max(1, stats?.total || 1) * 100)}%` }}
                                        >
                                            <span className="text-xs font-bold text-white">{stats?.inProgress || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 text-sm text-slate-600">With IT</div>
                                    <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-400 rounded-full flex items-center justify-end pr-3"
                                            style={{ width: `${Math.max(5, (stats?.withIT || 0) / Math.max(1, stats?.total || 1) * 100)}%` }}
                                        >
                                            <span className="text-xs font-bold text-white">{stats?.withIT || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 text-sm text-slate-600">Pending</div>
                                    <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-400 rounded-full flex items-center justify-end pr-3"
                                            style={{ width: `${Math.max(5, (stats?.pendingReview || 0) / Math.max(1, stats?.total || 1) * 100)}%` }}
                                        >
                                            <span className="text-xs font-bold text-white">{stats?.pendingReview || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 text-sm text-slate-600">Closed</div>
                                    <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-400 rounded-full flex items-center justify-end pr-3"
                                            style={{ width: `${Math.max(5, (stats?.closed || 0) / Math.max(1, stats?.total || 1) * 100)}%` }}
                                        >
                                            <span className="text-xs font-bold text-white">{stats?.closed || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Priority Breakdown */}
                        <div className="bg-white rounded-[2rem] shadow-soft p-6 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Active Tickets by Priority</h3>
                            <div className="flex-1 flex items-center justify-center gap-8">
                                <div className="text-center">
                                    <div className="size-24 rounded-full bg-red-100 flex items-center justify-center mb-3">
                                        <span className="text-3xl font-extrabold text-red-500">{stats?.high || 0}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">High</p>
                                </div>
                                <div className="text-center">
                                    <div className="size-24 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                        <span className="text-3xl font-extrabold text-amber-500">{stats?.medium || 0}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">Medium</p>
                                </div>
                                <div className="text-center">
                                    <div className="size-24 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                        <span className="text-3xl font-extrabold text-green-500">{stats?.low || 0}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">Low</p>
                                </div>
                            </div>
                        </div>

                        {/* Team Overview */}
                        <div className="bg-white rounded-[2rem] shadow-soft p-6 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Team Overview</h3>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                    <p className="text-3xl font-extrabold text-slate-900">{teamStats?.totalAgents || 0}</p>
                                    <p className="text-sm text-slate-500 mt-1">Active Agents</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                    <p className="text-3xl font-extrabold text-green-500">{teamStats?.totalResolved || 0}</p>
                                    <p className="text-sm text-slate-500 mt-1">Resolved This Period</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 text-center col-span-2">
                                    <p className="text-3xl font-extrabold text-[#EB4C36]">{teamStats?.overallScore || 0}</p>
                                    <p className="text-sm text-slate-500 mt-1">Average Team Score</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-[2rem] shadow-soft p-6 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h3>
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-600">Total Tickets</span>
                                    <span className="text-lg font-bold text-slate-900">{stats?.total || 0}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-600">Open Tickets</span>
                                    <span className="text-lg font-bold text-amber-500">{stats?.open || 0}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-600">Resolved</span>
                                    <span className="text-lg font-bold text-green-500">{(stats?.resolved || 0) + (stats?.closed || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-600">High Priority Active</span>
                                    <span className="text-lg font-bold text-red-500">{stats?.high || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
