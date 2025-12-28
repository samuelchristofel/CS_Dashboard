'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart } from 'recharts';

interface TrendData {
    name: string;
    avgHours: number;
    tickets: number;
}

interface ResolutionTrendChartProps {
    data: TrendData[];
    isLoading?: boolean;
    period?: string;
}

export default function ResolutionTrendChart({ data, isLoading = false, period = 'month' }: ResolutionTrendChartProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-[2rem] shadow-soft p-5 flex items-center justify-center h-[280px]">
                <span className="size-8 border-2 border-slate-200 border-t-[#EB4C36] rounded-full animate-spin" />
            </div>
        );
    }

    // Dynamic subtitle based on period
    const getSubtitle = () => {
        switch (period) {
            case 'today': return 'Last 7 days • Target: < 24h';
            case 'week': return 'Last 7 days • Target: < 24h';
            case 'month': return 'Last 4 months • Target: < 24h';
            case 'year': return 'This year (12 months) • Target: < 24h';
            default: return 'Last 6 months • Target: < 24h';
        }
    };

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const tickets = payload[0].payload.tickets;
            const status = value <= 24 ? 'Good' : value <= 48 ? 'Moderate' : 'Needs Improvement';
            const statusColor = value <= 24 ? 'text-emerald-600' : value <= 48 ? 'text-amber-600' : 'text-red-600';

            return (
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm">
                    <p className="font-bold text-slate-900">{label}</p>
                    <p className="text-slate-600">Avg Time: <span className="font-bold">{value}h</span></p>
                    <p className="text-slate-600">Tickets: <span className="font-bold">{tickets}</span></p>
                    <p className={`font-medium ${statusColor}`}>{status}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-soft p-5 overflow-hidden h-full flex flex-col">
            <div className="mb-3">
                <h3 className="text-base font-bold text-slate-900">Avg Resolution Time Trend</h3>
                <p className="text-xs text-slate-500">{getSubtitle()}</p>
            </div>

            {/* Recharts Line Chart */}
            <div className="flex-1 w-full min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(value) => `${value}h`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            y={24}
                            stroke="#10b981"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{ value: '24h target', position: 'right', fill: '#10b981', fontSize: 10 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="avgHours"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#colorGradient)"
                            dot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 7, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>≤ 24h (Good)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>24h - 48h</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>&gt; 48h</span>
                </div>
            </div>
        </div>
    );
}
