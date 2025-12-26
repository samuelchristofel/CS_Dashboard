'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface UserStats {
    assigned: number;
    active: number;
    closed: number;
    score: number;
}

interface AgentMetrics {
    id: string;
    name: string;
    role: string;
    metrics: {
        assigned: number;
        completed: number;
        avgHandlingTime: string;
        score: number | null;
        rating: string | null;
    };
}

export default function SeniorReportsPage() {
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [personalMetrics, setPersonalMetrics] = useState<AgentMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // Fetch personal stats
            const statsRes = await fetch(`/api/stats?user_id=${user.id}&role=${user.role}`);
            const statsData = await statsRes.json();
            if (statsData.userStats) {
                setUserStats(statsData.userStats);
            }

            // Fetch detailed performance metrics
            const perfRes = await fetch(`/api/performance?period=${period}`);
            const perfData = await perfRes.json();
            if (perfData.agents) {
                const myMetrics = perfData.agents.find((a: AgentMetrics) => a.id === user.id);
                if (myMetrics) {
                    setPersonalMetrics(myMetrics);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load reports');
        } finally {
            setIsLoading(false);
        }
    };

    const getRatingColor = (rating: string | null) => {
        switch (rating) {
            case 'Excellent':
            case 'Great':
                return 'text-green-500';
            case 'Good':
                return 'text-amber-500';
            case 'Needs Improvement':
                return 'text-orange-500';
            case 'At Risk':
                return 'text-red-500';
            default:
                return 'text-slate-500';
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">Your performance and activity reports</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2.5 bg-white rounded-full shadow-soft text-sm font-medium"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="all">All Time</option>
                    </select>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EB4C36] text-white rounded-full font-bold text-sm shadow-lg shadow-[#EB4C36]/30">
                        <span className="material-symbols-outlined text-lg">download</span>
                        Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <span className="size-8 border-2 border-slate-200 border-t-[#EB4C36] rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-6 shadow-soft">
                            <p className="text-sm text-slate-500">Tickets Handled</p>
                            <p className="text-4xl font-extrabold text-slate-900 mt-2">
                                {personalMetrics?.metrics.completed || userStats?.closed || 0}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {personalMetrics?.metrics.assigned || userStats?.assigned || 0} assigned
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-soft">
                            <p className="text-sm text-slate-500">Avg Resolution Time</p>
                            <p className="text-4xl font-extrabold text-slate-900 mt-2">
                                {personalMetrics?.metrics.avgHandlingTime || '-'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Target: 24h</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-soft">
                            <p className="text-sm text-slate-500">Active Tickets</p>
                            <p className="text-4xl font-extrabold text-amber-500 mt-2">
                                {userStats?.active || 0}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">currently assigned</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-soft">
                            <p className="text-sm text-slate-500">Performance Score</p>
                            <p className={`text-4xl font-extrabold mt-2 ${getRatingColor(personalMetrics?.metrics.rating || null)}`}>
                                {personalMetrics?.metrics.score || userStats?.score || 0}
                            </p>
                            <p className={`text-xs mt-1 ${getRatingColor(personalMetrics?.metrics.rating || null)}`}>
                                {personalMetrics?.metrics.rating || 'out of 100'}
                            </p>
                        </div>
                    </div>

                    {/* Performance Breakdown */}
                    <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
                        <div className="bg-white rounded-[2rem] shadow-soft p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Score Breakdown</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">Base Score (Volume)</span>
                                        <span className="font-bold text-slate-900">60%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#EB4C36] rounded-full"
                                            style={{ width: `${Math.min(100, ((personalMetrics?.metrics.completed || 0) / 40) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {personalMetrics?.metrics.completed || 0} of 40 target tickets
                                    </p>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">Speed Bonus</span>
                                        <span className="font-bold text-slate-900">25%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Avg time: {personalMetrics?.metrics.avgHandlingTime || '-'}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">Quality Bonus</span>
                                        <span className="font-bold text-slate-900">15%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Low rejection rate</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2rem] shadow-soft p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Performance Tips</h3>
                            <div className="space-y-3">
                                {personalMetrics?.metrics.score && personalMetrics.metrics.score >= 80 ? (
                                    <>
                                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                                            <div>
                                                <p className="text-sm font-semibold text-green-700">Great performance!</p>
                                                <p className="text-xs text-green-600">Keep up the excellent work.</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                                            <span className="material-symbols-outlined text-amber-500">tips_and_updates</span>
                                            <div>
                                                <p className="text-sm font-semibold text-amber-700">Increase ticket volume</p>
                                                <p className="text-xs text-amber-600">Aim for 40 tickets/month for maximum base score.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                                            <span className="material-symbols-outlined text-blue-500">schedule</span>
                                            <div>
                                                <p className="text-sm font-semibold text-blue-700">Optimize response time</p>
                                                <p className="text-xs text-blue-600">Target under 24h for full speed bonus.</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
