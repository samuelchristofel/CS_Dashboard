'use client';

import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface TicketDistributionChartProps {
    open: number;
    inProgress: number;
    withIT: number;
    pending: number;
    closed: number;
}

interface QuickStatsChartProps {
    total: number;
    open: number;
    resolved: number;
    high: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2">
                <p className="text-sm font-bold text-slate-900">{label}</p>
                <p className="text-sm text-slate-600">{payload[0].value} tickets</p>
            </div>
        );
    }
    return null;
};

export function TicketDistributionChart({ open, inProgress, withIT, pending, closed }: TicketDistributionChartProps) {
    const data = [
        { name: 'Open', value: open, fill: '#fbbf24' },
        { name: 'In Progress', value: inProgress, fill: '#60a5fa' },
        { name: 'With IT', value: withIT, fill: '#a78bfa' },
        { name: 'Pending', value: pending, fill: '#fb923c' },
        { name: 'Closed', value: closed, fill: '#4ade80' },
    ];

    return (
        <div className="bg-white rounded-[2rem] shadow-soft p-5 flex flex-col h-full">
            <h3 className="text-base font-bold text-slate-900 mb-3">Ticket Status Distribution</h3>
            <div className="flex-1 min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={70} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function QuickStatsChart({ total, open, resolved, high }: QuickStatsChartProps) {
    const data = [
        { name: 'Total', value: total, fill: '#334155' },
        { name: 'Open', value: open, fill: '#fbbf24' },
        { name: 'Resolved', value: resolved, fill: '#4ade80' },
        { name: 'High Priority', value: high, fill: '#f87171' },
    ];

    return (
        <div className="bg-white rounded-[2rem] shadow-soft p-5 flex flex-col h-full">
            <h3 className="text-base font-bold text-slate-900 mb-3">Quick Stats</h3>
            <div className="flex-1 min-h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
