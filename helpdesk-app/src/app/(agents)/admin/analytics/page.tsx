'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import CustomSelect from '@/components/ui/CustomSelect';
import { TicketDistributionChart, QuickStatsChart } from '@/components/charts/TicketStatusChart';

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
            // Fetch overall stats with period filter
            const statsRes = await fetch(`/api/stats?period=${period}`);
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
                    <CustomSelect
                        value={period}
                        onChange={setPeriod}
                        options={[
                            { value: 'week', label: 'Last 7 days' },
                            { value: 'month', label: 'Last 30 days' },
                            { value: 'quarter', label: 'Last 90 days' },
                            { value: 'all', label: 'All Time' },
                        ]}
                        variant="filter"
                    />
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

                    {/* Charts Section - 2x2 Bento Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-6">
                        {/* Top Left: Ticket Status Distribution */}
                        <TicketDistributionChart
                            open={stats?.open || 0}
                            inProgress={stats?.inProgress || 0}
                            withIT={stats?.withIT || 0}
                            pending={stats?.pendingReview || 0}
                            closed={stats?.closed || 0}
                        />

                        {/* Top Right: Priority Breakdown - Pie Chart */}
                        <div className="bg-white rounded-[2rem] shadow-soft p-6 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Active Tickets by Priority</h3>
                            <div className="flex-1 flex items-center justify-center gap-8">
                                {/* Pie Chart */}
                                <div className="relative">
                                    <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                                        {(() => {
                                            const total = (stats?.high || 0) + (stats?.medium || 0) + (stats?.low || 0);
                                            if (total === 0) return null;

                                            const high = stats?.high || 0;
                                            const medium = stats?.medium || 0;
                                            const low = stats?.low || 0;

                                            const highPercent = (high / total) * 100;
                                            const mediumPercent = (medium / total) * 100;
                                            const lowPercent = (low / total) * 100;

                                            const radius = 70;
                                            const circumference = 2 * Math.PI * radius;

                                            // Calculate stroke dash offsets for each segment
                                            const highDash = (highPercent / 100) * circumference;
                                            const mediumDash = (mediumPercent / 100) * circumference;
                                            const lowDash = (lowPercent / 100) * circumference;

                                            return (
                                                <>
                                                    {/* High Priority - Red */}
                                                    <circle
                                                        cx="90"
                                                        cy="90"
                                                        r={radius}
                                                        fill="none"
                                                        stroke="#ef4444"
                                                        strokeWidth="40"
                                                        strokeDasharray={`${highDash} ${circumference - highDash}`}
                                                        strokeDashoffset="0"
                                                        className="transition-all duration-300"
                                                    />
                                                    {/* Medium Priority - Amber */}
                                                    <circle
                                                        cx="90"
                                                        cy="90"
                                                        r={radius}
                                                        fill="none"
                                                        stroke="#f59e0b"
                                                        strokeWidth="40"
                                                        strokeDasharray={`${mediumDash} ${circumference - mediumDash}`}
                                                        strokeDashoffset={-highDash}
                                                        className="transition-all duration-300"
                                                    />
                                                    {/* Low Priority - Green */}
                                                    <circle
                                                        cx="90"
                                                        cy="90"
                                                        r={radius}
                                                        fill="none"
                                                        stroke="#10b981"
                                                        strokeWidth="40"
                                                        strokeDasharray={`${lowDash} ${circumference - lowDash}`}
                                                        strokeDashoffset={-(highDash + mediumDash)}
                                                        className="transition-all duration-300"
                                                    />
                                                    {/* Center circle for donut effect */}
                                                    <circle
                                                        cx="90"
                                                        cy="90"
                                                        r="45"
                                                        fill="white"
                                                    />
                                                </>
                                            );
                                        })()}
                                    </svg>
                                    {/* Center text */}
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-3xl font-extrabold text-slate-900">
                                            {(stats?.high || 0) + (stats?.medium || 0) + (stats?.low || 0)}
                                        </span>
                                        <span className="text-xs text-slate-500 font-medium">Total</span>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-4 rounded-full bg-red-500"></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">High</p>
                                            <p className="text-xs text-slate-500">{stats?.high || 0} tickets</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="size-4 rounded-full bg-amber-500"></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">Medium</p>
                                            <p className="text-xs text-slate-500">{stats?.medium || 0} tickets</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="size-4 rounded-full bg-green-500"></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">Low</p>
                                            <p className="text-xs text-slate-500">{stats?.low || 0} tickets</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Left: Quick Stats */}
                        <QuickStatsChart
                            total={stats?.total || 0}
                            open={stats?.open || 0}
                            resolved={(stats?.resolved || 0) + (stats?.closed || 0)}
                            high={stats?.high || 0}
                        />

                        {/* Bottom Right: Team Overview */}
                        <div className="bg-white rounded-[2rem] shadow-soft p-5 flex flex-col">
                            <h3 className="text-base font-bold text-slate-900 mb-3">Team Overview</h3>
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
                    </div>
                </>
            )}
        </>
    );
}
