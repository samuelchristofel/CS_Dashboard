"use client";

interface ScoreBreakdownChartProps {
  baseScore: number; // 0-60
  speedBonus: number; // 0-25
  qualityBonus: number; // 0-15
  totalScore: number; // 0-100
  ticketsCompleted?: number;
  targetTickets?: number;
  avgTime?: string;
}

export default function ScoreBreakdownChart({ baseScore, speedBonus, qualityBonus, totalScore, ticketsCompleted = 0, targetTickets = 40, avgTime = "-" }: ScoreBreakdownChartProps) {
  const metrics = [
    {
      name: "Base Score",
      value: baseScore,
      max: 60,
      color: "bg-orange-500",
      bgColor: "bg-orange-100",
      subtitle: `${ticketsCompleted} of ${targetTickets} target tickets`,
    },
    {
      name: "Speed Bonus",
      value: speedBonus,
      max: 25,
      color: "bg-blue-500",
      bgColor: "bg-blue-100",
      subtitle: `Avg time: ${avgTime}`,
    },
    {
      name: "Quality Bonus",
      value: qualityBonus,
      max: 15,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-100",
      subtitle: "Low rejection rate",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-soft p-5 h-full flex flex-col">
      {/* Header with total score */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-slate-900">Score Breakdown</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-slate-900">{totalScore}</span>
          <span className="text-sm text-slate-400 font-medium">/100</span>
        </div>
      </div>

      {/* Progress bars */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {metrics.map((metric, index) => {
          const percentage = (metric.value / metric.max) * 100;
          return (
            <div key={index}>
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-slate-700">{metric.name}</span>
                <span className="text-sm font-bold text-slate-900">
                  {metric.value}
                  <span className="text-slate-400 font-medium">/{metric.max}</span>
                </span>
              </div>
              {/* Progress bar */}
              <div className={`h-3 rounded-full ${metric.bgColor} overflow-hidden`}>
                <div className={`h-full rounded-full ${metric.color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
              </div>
              {/* Subtitle */}
              <p className="text-[10px] text-slate-400 mt-1">{metric.subtitle}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
