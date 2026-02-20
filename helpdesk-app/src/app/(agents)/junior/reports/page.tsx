"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import CustomSelect from "@/components/ui/CustomSelect";
import ResolutionTrendChart from "@/components/charts/ResolutionTrendChart";
import ScoreBreakdownChart from "@/components/charts/ScoreBreakdownChart";

// Dynamic import for PDF export (client-side only)
const ExportReportButton = dynamic(() => import("@/components/reports/ExportReportButton"), {
  ssr: false,
  loading: () => (
    <button disabled className="flex items-center gap-2 px-5 py-2.5 bg-slate-300 text-slate-500 rounded-full font-bold text-sm cursor-not-allowed">
      <span className="material-symbols-outlined text-lg">download</span>
      Export
    </button>
  ),
});

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

export default function JuniorReportsPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [personalMetrics, setPersonalMetrics] = useState<AgentMetrics | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [userName, setUserName] = useState("Junior CS");

  useEffect(() => {
    fetchData();
  }, [period, customDateFrom, customDateTo]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      setUserName(user.name || "Junior CS");

      // Build period parameter
      let periodParam = period;
      if (period === "custom" && customDateFrom && customDateTo) {
        periodParam = `custom_${customDateFrom}_${customDateTo}`;
      }

      // Fetch personal stats with period
      const statsRes = await fetch(`/api/stats?user_id=${user.id}&role=${user.role}&period=${periodParam}`);
      const statsData = await statsRes.json();
      if (statsData.userStats) {
        setUserStats(statsData.userStats);
      }
      if (statsData.trends) {
        setTrends(statsData.trends);
      }

      // Fetch detailed performance metrics
      const perfRes = await fetch(`/api/performance?period=${periodParam}`);
      const perfData = await perfRes.json();
      if (perfData.agents) {
        const myMetrics = perfData.agents.find((a: AgentMetrics) => a.id === user.id);
        if (myMetrics) {
          setPersonalMetrics(myMetrics);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingColor = (rating: string | null) => {
    switch (rating) {
      case "Excellent":
      case "Great":
        return "text-green-500";
      case "Good":
        return "text-amber-500";
      case "Needs Improvement":
        return "text-orange-500";
      case "At Risk":
        return "text-red-500";
      default:
        return "text-slate-500";
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
          <CustomSelect
            value={period}
            onChange={setPeriod}
            options={[
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "quarter", label: "This Quarter" },
              { value: "year", label: "This Year" },
              { value: "all", label: "All Time" },
              { value: "custom", label: "Custom Date Range" },
            ]}
            variant="filter"
          />
          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <span className="text-slate-400">→</span>
              <input type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          )}
          <ExportReportButton
            userName={userName}
            period={period === "week" ? "This Week" : period === "month" ? "This Month" : period === "quarter" ? "This Quarter" : period === "year" ? "This Year" : "All Time"}
            personalStats={{
              ticketsHandled: personalMetrics?.metrics.completed || userStats?.closed || 0,
              avgResolutionTime: personalMetrics?.metrics.avgHandlingTime || "-",
              activeTickets: userStats?.active || 0,
              performanceScore: personalMetrics?.metrics.score || userStats?.score || 0,
            }}
            teamStats={{
              totalJuniors: 0,
              teamDone: 0,
              avgTime: "-",
              avgScore: 0,
              active: 0,
              resRate: "-",
              assigned: 0,
              topScore: 0,
            }}
            juniors={[]}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Bento Grid Layout */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="size-8 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 overflow-auto no-scrollbar">
          {/* Row 1: Your Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-soft">
              <p className="text-sm text-slate-500">Tickets Handled</p>
              <p className="text-4xl font-extrabold text-slate-900 mt-2">{personalMetrics?.metrics.completed || userStats?.closed || 0}</p>
              <p className="text-xs text-slate-400 mt-1">{personalMetrics?.metrics.assigned || userStats?.assigned || 0} assigned</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-soft">
              <p className="text-sm text-slate-500">Avg Resolution Time</p>
              <p className="text-4xl font-extrabold text-slate-900 mt-2">{personalMetrics?.metrics.avgHandlingTime || "-"}</p>
              <p className="text-xs text-slate-400 mt-1">Target: 24h</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-soft">
              <p className="text-sm text-slate-500">Active Tickets</p>
              <p className="text-4xl font-extrabold text-amber-500 mt-2">{userStats?.active || 0}</p>
              <p className="text-xs text-slate-400 mt-1">currently assigned</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-soft">
              <p className="text-sm text-slate-500">Performance Score</p>
              <p className={`text-4xl font-extrabold mt-2 ${getRatingColor(personalMetrics?.metrics.rating || null)}`}>{personalMetrics?.metrics.score || userStats?.score || 0}</p>
              <p className={`text-xs mt-1 ${getRatingColor(personalMetrics?.metrics.rating || null)}`}>{personalMetrics?.metrics.rating || "out of 100"}</p>
            </div>
          </div>

          {/* Row 2: Score Breakdown + Resolution Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Breakdown Chart - takes 1 column */}
            <ScoreBreakdownChart
              baseScore={Math.min(60, Math.round(((personalMetrics?.metrics.completed || 0) / 40) * 60))}
              speedBonus={
                personalMetrics?.metrics.avgHandlingTime && personalMetrics.metrics.avgHandlingTime !== "-"
                  ? parseFloat(personalMetrics.metrics.avgHandlingTime) <= 24
                    ? 25
                    : parseFloat(personalMetrics.metrics.avgHandlingTime) <= 48
                      ? 15
                      : 5
                  : 0
              }
              qualityBonus={15}
              totalScore={personalMetrics?.metrics.score || userStats?.score || 0}
              ticketsCompleted={personalMetrics?.metrics.completed || 0}
              targetTickets={40}
              avgTime={personalMetrics?.metrics.avgHandlingTime || "-"}
            />

            {/* Resolution Trend Chart - takes 2 columns */}
            <div className="lg:col-span-2">
              <ResolutionTrendChart data={trends} isLoading={isLoading} period={period} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
