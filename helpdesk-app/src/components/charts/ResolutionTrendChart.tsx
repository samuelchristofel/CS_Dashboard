'use client';

interface TrendData {
    name: string;
    avgHours: number;
    tickets: number;
}

interface ResolutionTrendChartProps {
    data: TrendData[];
    isLoading?: boolean;
}

export default function ResolutionTrendChart({ data, isLoading = false }: ResolutionTrendChartProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-[2rem] shadow-soft p-6 h-full flex items-center justify-center min-h-[300px]">
                <span className="size-8 border-2 border-slate-200 border-t-[#EB4C36] rounded-full animate-spin" />
            </div>
        );
    }

    const maxHours = Math.max(...data.map(d => d.avgHours), 1);

    // Helper to calculate bar height percentage (max 80% to leave room for labels)
    const getHeight = (hours: number) => {
        if (hours === 0) return 2; // Min height for visibility
        return Math.max(2, (hours / maxHours) * 80);
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-soft p-6 h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Avg Resolution Time Trend</h3>
                <p className="text-xs text-slate-500">Last 6 months • Target: &lt; 24h</p>
            </div>

            <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px] px-2 relative">
                {/* Y-Axis Grid Lines (simplified) */}
                <div className="absolute inset-x-0 bottom-8 top-0 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="border-t border-slate-900 w-full" />
                    <div className="border-t border-slate-900 w-full" />
                    <div className="border-t border-slate-900 w-full" />
                    <div className="border-t border-slate-900 w-full" />
                </div>

                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 flex-1 group relative z-10">
                        {/* Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-20">
                            {item.avgHours}h ({item.tickets} tickets)
                        </div>

                        {/* Bar */}
                        <div
                            className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 relative group-hover:brightness-95 ${item.avgHours <= 24 ? 'bg-emerald-500' :
                                    item.avgHours <= 48 ? 'bg-amber-400' : 'bg-red-400'
                                }`}
                            style={{ height: `${getHeight(item.avgHours)}%` }}
                        >
                            {/* Value Label inside bar if tall enough, else above */}
                            {getHeight(item.avgHours) > 20 && (
                                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/90">
                                    {item.avgHours}
                                </span>
                            )}
                        </div>

                        {/* X-Axis Label */}
                        <div className="text-[10px] sm:text-xs font-medium text-slate-500">
                            {item.name}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>&le; 24h</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>24h - 48h</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span>&gt; 48h</span>
                </div>
            </div>
        </div>
    );
}
