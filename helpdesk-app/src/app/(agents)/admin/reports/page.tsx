"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomSelect from "@/components/ui/CustomSelect";

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

interface TeamStats {
  totalResolved: number;
  avgResolutionTime: string;
  overallScore: number;
  totalAgents: number;
}

interface PerformanceData {
  agents: AgentMetrics[];
  teamStats: TeamStats;
  period: string;
}

const roleLabels: Record<string, string> = {
  senior: "Senior CS",
  junior: "Junior CS",
  it: "IT Support",
};

const scoreColors: Record<string, string> = {
  Excellent: "text-green-500",
  Great: "text-green-500",
  Good: "text-amber-500",
  "Needs Improvement": "text-orange-500",
  "At Risk": "text-red-500",
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0, pending: 0 });
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  useEffect(() => {
    fetchData();
  }, [period, customDateFrom, customDateTo]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Build period parameter
      let periodParam = period;
      if (period === "custom" && customDateFrom && customDateTo) {
        periodParam = `custom_${customDateFrom}_${customDateTo}`;
      }

      // Fetch performance data
      const perfRes = await fetch(`/api/performance?period=${periodParam}`);
      const perfData = await perfRes.json();
      setPerformanceData(perfData);

      // Fetch overall stats
      const statsRes = await fetch("/api/stats");
      const statsData = await statsRes.json();
      setStats(statsData.stats || { total: 0, open: 0, resolved: 0 });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Company-wide performance metrics</p>
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
              <input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              <span className="text-slate-400">→</span>
              <input type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
            </div>
          )}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-full font-bold text-sm shadow-lg shadow-slate-800/30 hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-soft">
          <p className="text-sm text-slate-500">Total Tickets</p>
          <p className="text-4xl font-extrabold text-slate-900 mt-2">{isLoading ? "..." : stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-soft">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="text-4xl font-extrabold text-green-500 mt-2">{isLoading ? "..." : stats.resolved}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-soft">
          <p className="text-sm text-slate-500">Open</p>
          <p className="text-4xl font-extrabold text-amber-500 mt-2">{isLoading ? "..." : stats.open}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-soft">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-4xl font-extrabold text-indigo-500 mt-2">{isLoading ? "..." : stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-soft">
          <p className="text-sm text-slate-500">Avg Resolution</p>
          <p className="text-4xl font-extrabold text-blue-500 mt-2">{isLoading ? "..." : performanceData?.teamStats.avgResolutionTime || "-"}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-soft">
          <p className="text-sm text-slate-500">Team Score</p>
          <p className="text-4xl font-extrabold text-slate-900 mt-2">{isLoading ? "..." : performanceData?.teamStats.overallScore || "-"}</p>
        </div>
      </div>

      {/* Team Performance */}
      <div className="flex-1 bg-white rounded-lg shadow-soft p-6 overflow-auto">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Team Performance</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="size-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-3">Agent</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Assigned</th>
                <th className="pb-3">Completed</th>
                <th className="pb-3">Avg Time</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {performanceData?.agents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No performance data available
                  </td>
                </tr>
              ) : (
                performanceData?.agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => router.push(`/admin/reports/${agent.id}`)}>
                    <td className="py-4 text-sm font-semibold text-slate-900">{agent.name}</td>
                    <td className="py-4 text-sm text-slate-500">{roleLabels[agent.role] || agent.role}</td>
                    <td className="py-4 text-sm text-slate-900">{agent.metrics.assigned}</td>
                    <td className="py-4 text-sm text-green-500">{agent.metrics.completed}</td>
                    <td className="py-4 text-sm text-slate-900">{agent.metrics.avgHandlingTime}</td>
                    <td className="py-4">
                      {agent.metrics.score !== null ? (
                        <span className={`text-sm font-bold ${scoreColors[agent.metrics.rating || ""] || "text-slate-500"}`}>{agent.metrics.score}</span>
                      ) : (
                        <span className="text-sm font-bold text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-4">
                      {agent.metrics.rating ? (
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            agent.metrics.rating === "Excellent"
                              ? "bg-green-50 text-green-600"
                              : agent.metrics.rating === "Great"
                                ? "bg-green-50 text-green-600"
                                : agent.metrics.rating === "Good"
                                  ? "bg-amber-50 text-amber-600"
                                  : agent.metrics.rating === "Needs Improvement"
                                    ? "bg-orange-50 text-orange-600"
                                    : "bg-red-50 text-red-600"
                          }`}
                        >
                          {agent.metrics.rating}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
