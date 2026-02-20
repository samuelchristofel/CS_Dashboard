"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

interface Params {
  agentId: string;
}

export default function IndividualAgentReportPage({ params }: { params: Params }) {
  const router = useRouter();
  const { agentId } = params;

  const [agent, setAgent] = useState<AgentMetrics | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [juniorAgents, setJuniorAgents] = useState<AgentMetrics[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchData();
  }, [period, agentId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch agent performance metrics
      const perfRes = await fetch(`/api/performance?period=${period}`);
      const perfData = await perfRes.json();

      if (perfData.agents) {
        const agentData = perfData.agents.find((a: AgentMetrics) => a.id === agentId);
        if (agentData) {
          setAgent(agentData);

          // If agent is Senior, get their juniors
          if (agentData.role === "senior") {
            const juniors = perfData.agents.filter((a: AgentMetrics) => a.role === "junior");
            setJuniorAgents(juniors);
          }
        }
      }

      // Fetch agent stats with period
      const statsRes = await fetch(`/api/stats?user_id=${agentId}&period=${period}`);
      const statsData = await statsRes.json();
      if (statsData.userStats) {
        setUserStats(statsData.userStats);
      }
      if (statsData.trends) {
        setTrends(statsData.trends);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load agent report");
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
          <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2 transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Reports
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{agent?.name || "Agent Report"}</h1>
          <p className="text-sm text-slate-500 mt-1">Individual performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <CustomSelect
            value={period}
            onChange={setPeriod}
            options={[
              { value: "today", label: "Today" },
              { value: "week", label: "Last Week" },
              { value: "month", label: "Last Month" },
              { value: "year", label: "This Year" },
            ]}
            variant="filter"
          />
          <ExportReportButton
            userName={agent?.name || "Agent"}
            period={period === "week" ? "This Week" : period === "month" ? "This Month" : period === "year" ? "This Year" : "All Time"}
            personalStats={{
              ticketsHandled: agent?.metrics.completed || userStats?.closed || 0,
              avgResolutionTime: agent?.metrics.avgHandlingTime || "-",
              activeTickets: userStats?.active || 0,
              performanceScore: agent?.metrics.score || userStats?.score || 0,
            }}
            teamStats={{
              totalJuniors: juniorAgents.length,
              teamDone: juniorAgents.reduce((sum, a) => sum + (a.metrics.completed || 0), 0),
              avgTime: (() => {
                const times = juniorAgents
                  .map((a) => a.metrics.avgHandlingTime)
                  .filter((t) => t && t !== "-")
                  .map((t) => parseFloat(t) || 0);
                if (times.length === 0) return "-";
                return (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) + "h";
              })(),
              avgScore: (() => {
                const scores = juniorAgents.map((a) => a.metrics.score).filter((s) => s !== null) as number[];
                if (scores.length === 0) return 0;
                return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
              })(),
              active: juniorAgents.reduce((sum, a) => sum + ((a.metrics.assigned || 0) - (a.metrics.completed || 0)), 0),
              resRate: (() => {
                const totalAssigned = juniorAgents.reduce((sum, a) => sum + (a.metrics.assigned || 0), 0);
                const totalCompleted = juniorAgents.reduce((sum, a) => sum + (a.metrics.completed || 0), 0);
                if (totalAssigned === 0) return "-";
                return Math.round((totalCompleted / totalAssigned) * 100) + "%";
              })(),
              assigned: juniorAgents.reduce((sum, a) => sum + (a.metrics.assigned || 0), 0),
              topScore: (() => {
                const best = juniorAgents.reduce((max, a) => ((a.metrics.score || 0) > (max.metrics.score || 0) ? a : max), juniorAgents[0] || { metrics: { score: 0 } });
                return best?.metrics.score || 0;
              })(),
            }}
            juniors={juniorAgents.map((j) => ({
              name: j.name,
              completed: j.metrics.completed || 0,
              avgTime: j.metrics.avgHandlingTime || "-",
              score: j.metrics.score,
              rating: j.metrics.rating,
            }))}
            disabled={isLoading || juniorAgents.length === 0}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="size-8 border-2 border-slate-200 border-t-[#EB4C36] rounded-full animate-spin" />
        </div>
      ) : !agent ? (
        <div className="flex items-center justify-center py-12 text-slate-400">Agent not found</div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 overflow-auto no-scrollbar">
          {/* Row 1: Agent Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-soft">
              <p className="text-sm text-slate-500">Tickets Handled</p>
              <p className="text-4xl font-extrabold text-slate-900 mt-2">{agent.metrics.completed || 0}</p>
              <p className="text-xs text-slate-400 mt-1">{agent.metrics.assigned || 0} assigned</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-soft">
              <p className="text-sm text-slate-500">Avg Resolution Time</p>
              <p className="text-4xl font-extrabold text-slate-900 mt-2">{agent.metrics.avgHandlingTime || "-"}</p>
              <p className="text-xs text-slate-400 mt-1">Target: 24h</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-soft">
              <p className="text-sm text-slate-500">Active Tickets</p>
              <p className="text-4xl font-extrabold text-amber-500 mt-2">{userStats?.active || 0}</p>
              <p className="text-xs text-slate-400 mt-1">currently assigned</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-soft">
              <p className="text-sm text-slate-500">Performance Score</p>
              <p className={`text-4xl font-extrabold mt-2 ${getRatingColor(agent.metrics.rating || null)}`}>{agent.metrics.score || 0}</p>
              <p className={`text-xs mt-1 ${getRatingColor(agent.metrics.rating || null)}`}>{agent.metrics.rating || "out of 100"}</p>
            </div>
          </div>

          {/* Row 2: Score Breakdown + Resolution Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Breakdown Chart - takes 1 column */}
            <ScoreBreakdownChart
              baseScore={Math.min(60, Math.round(((agent.metrics.completed || 0) / 40) * 60))}
              speedBonus={agent.metrics.avgHandlingTime && agent.metrics.avgHandlingTime !== "-" ? (parseFloat(agent.metrics.avgHandlingTime) <= 24 ? 25 : parseFloat(agent.metrics.avgHandlingTime) <= 48 ? 15 : 5) : 0}
              qualityBonus={15}
              totalScore={agent.metrics.score || 0}
              ticketsCompleted={agent.metrics.completed || 0}
              targetTickets={40}
              avgTime={agent.metrics.avgHandlingTime || "-"}
            />

            {/* Resolution Trend Chart - takes 2 columns */}
            <div className="lg:col-span-2">
              <ResolutionTrendChart data={trends} isLoading={isLoading} period={period} />
            </div>
          </div>

          {/* Row 3: Team Overview (only for Senior agents) */}
          {agent.role === "senior" && juniorAgents.length > 0 && (
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Team Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Row 1 */}
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-slate-900">{juniorAgents.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Juniors</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-emerald-600">{juniorAgents.reduce((sum, a) => sum + (a.metrics.completed || 0), 0)}</p>
                  <p className="text-xs text-slate-500 mt-1">Team Done</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-blue-600">
                    {(() => {
                      const times = juniorAgents
                        .map((a) => a.metrics.avgHandlingTime)
                        .filter((t) => t && t !== "-")
                        .map((t) => parseFloat(t) || 0);
                      if (times.length === 0) return "-";
                      return (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) + "h";
                    })()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Avg Time</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-amber-600">
                    {(() => {
                      const scores = juniorAgents.map((a) => a.metrics.score).filter((s) => s !== null) as number[];
                      if (scores.length === 0) return "-";
                      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                    })()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Avg Score</p>
                </div>

                {/* Row 2 - Additional Stats */}
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-orange-600">{juniorAgents.reduce((sum, a) => sum + ((a.metrics.assigned || 0) - (a.metrics.completed || 0)), 0)}</p>
                  <p className="text-xs text-slate-500 mt-1">Active</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-purple-600">
                    {(() => {
                      const totalAssigned = juniorAgents.reduce((sum, a) => sum + (a.metrics.assigned || 0), 0);
                      const totalCompleted = juniorAgents.reduce((sum, a) => sum + (a.metrics.completed || 0), 0);
                      if (totalAssigned === 0) return "-";
                      return Math.round((totalCompleted / totalAssigned) * 100) + "%";
                    })()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Res Rate</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-red-600">{juniorAgents.reduce((sum, a) => sum + (a.metrics.assigned || 0), 0)}</p>
                  <p className="text-xs text-slate-500 mt-1">Assigned</p>
                </div>
                <div className="bg-cyan-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-cyan-600">
                    {(() => {
                      const best = juniorAgents.reduce((max, a) => ((a.metrics.score || 0) > (max.metrics.score || 0) ? a : max), juniorAgents[0]);
                      return best?.metrics.score || "-";
                    })()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Top Score</p>
                </div>
              </div>
            </div>
          )}

          {/* Row 4: Junior Performance Cards (only for Senior agents) */}
          {agent.role === "senior" && juniorAgents.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Junior Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                {juniorAgents.map((junior) => (
                  <div key={junior.id} className="bg-white rounded-lg p-5 shadow-soft">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-bold text-sm">
                          {junior.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{junior.name}</p>
                        <p className="text-xs text-slate-400">Junior CS</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          junior.metrics.rating === "Excellent" || junior.metrics.rating === "Great" ? "bg-green-100 text-green-700" : junior.metrics.rating === "Good" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {junior.metrics.rating || "N/A"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-xl font-extrabold text-slate-900">{junior.metrics.completed || 0}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Done</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-xl font-extrabold text-slate-900">{junior.metrics.avgHandlingTime || "-"}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Avg Time</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-xl font-extrabold text-slate-900">{junior.metrics.score ?? "-"}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
