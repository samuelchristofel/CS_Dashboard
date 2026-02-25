import type { UserRole } from "@/types";
import CustomSelect from "@/components/ui/CustomSelect";

interface ScoreCardProps {
  role: UserRole;
  userName: string;
  score: number;
  maxScore?: number;
  message: string;
  period?: string;
  periodFilter?: "week" | "month" | "year";
  onPeriodChange?: (value: "week" | "month" | "year") => void;
  compactStats?: Array<{
    label: string;
    value: number | string;
  }>;
  compactStatsVariant?: "accent" | "overlay";
}

const gradients: Record<UserRole, string> = {
  senior: "from-[#EB4C36] to-[#d13a25]",
  junior: "from-[#EB4C36] to-[#d13a25]",
  it: "from-blue-500 to-blue-700",
  admin: "from-slate-800 to-slate-900",
};

// Generate current month/year dynamically
const currentPeriod = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default function ScoreCard({
  role,
  userName,
  score,
  maxScore = 100,
  message,
  period = currentPeriod,
  periodFilter,
  onPeriodChange,
  compactStats = [],
  compactStatsVariant = "accent",
}: ScoreCardProps) {
  const gradient = gradients[role];
  const isAdminOrIT = role === "admin" || role === "it";
  const showPeriodFilter = role !== "admin" && !!periodFilter && !!onPeriodChange;
  const statNumberTones = ["text-rose-100", "text-amber-100", "text-sky-100", "text-emerald-100"];
  const statAccentBars = ["bg-rose-300/80", "bg-amber-300/80", "bg-sky-300/80", "bg-emerald-300/80"];

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-lg shadow-soft p-6 text-white`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold opacity-90">{role === "admin" ? "System Overview" : `Halo ${userName},`}</p>
          <p className="text-xs opacity-70">{isAdminOrIT ? "Total Resolved:" : "Sisa Poin Bulan Ini:"}</p>
        </div>
        {showPeriodFilter ? (
            <CustomSelect
            value={periodFilter!}
            onChange={(val) => onPeriodChange!(val as "week" | "month" | "year")}
            options={[
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "year", label: "This Year" },
            ]}
            variant="filter-overlay"
          />
        ) : (
          <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full">{period}</span>
        )}
      </div>
      <div className="flex items-end gap-3">
        <span className="text-5xl font-extrabold">{score}</span>
        <span className="text-2xl font-bold opacity-70 mb-1">{isAdminOrIT ? "tickets" : `/${maxScore}`}</span>
      </div>
      <p className="text-sm opacity-80 mt-2">{message}</p>
      {compactStats.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {compactStats.map((stat, idx) =>
            compactStatsVariant === "overlay" ? (
              <div key={stat.label} className="bg-white/15 border border-white/25 rounded-lg p-2.5 text-center">
                <p className="text-xl font-bold text-white leading-none">{stat.value}</p>
                <p className="text-[9px] font-semibold text-white/70 uppercase tracking-wide mt-1">{stat.label}</p>
              </div>
            ) : (
              <div key={stat.label} className="relative overflow-hidden rounded-lg border border-white/25 bg-black/20 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm">
                <div className={`absolute inset-x-0 top-0 h-0.5 ${statAccentBars[idx % statAccentBars.length]}`} />
                <p className={`text-2xl font-extrabold leading-none tracking-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.25)] ${statNumberTones[idx % statNumberTones.length]}`}>{stat.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-white/70">{stat.label}</p>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
