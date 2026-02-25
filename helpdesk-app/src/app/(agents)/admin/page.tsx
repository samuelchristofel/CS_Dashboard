"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CustomSelect from "@/components/ui/CustomSelect";
import AddUserModal from "@/components/modals/AddUserModal";
import type { UserFormData } from "@/components/modals/AddUserModal";

interface Activity {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  withIT: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, inProgress: 0, resolved: 0, withIT: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [unassignedTickets, setUnassignedTickets] = useState<any[]>([]);
  const [topAgent, setTopAgent] = useState<any>(null);
  const [commonIssues, setCommonIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<"week" | "month" | "year">("month");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const statsRes = await fetch("/api/stats");
      const statsData = await statsRes.json();
      if (statsData.stats) {
        setStats({
          total: statsData.stats.total,
          open: statsData.stats.open,
          inProgress: statsData.stats.inProgress,
          resolved: statsData.stats.resolved + statsData.stats.closed,
          withIT: statsData.stats.withIT,
        });
      }

      const activitiesRes = await fetch("/api/activities?limit=10");
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesData.activities || []);

      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      setUsers((usersData.users || []).filter((u: User) => u.role !== "admin"));

      // Fetch unassigned tickets sorted by most recent
      const ticketsRes = await fetch("/api/tickets?unassigned=true");
      const ticketsData = await ticketsRes.json();
      const unassigned = (ticketsData.tickets || []).filter((t: any) => t.status !== "CLOSED" && t.status !== "RESOLVED").sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setUnassignedTickets(unassigned);

      // Fetch top agent this week
      try {
        const perfRes = await fetch("/api/performance?period=week");
        const perfData = await perfRes.json();
        if (perfData.agents && perfData.agents.length > 0) {
          const topAgentData = perfData.agents.reduce((max: any, agent: any) => ((agent.metrics?.completed || 0) > (max.metrics?.completed || 0) ? agent : max));
          setTopAgent(topAgentData);
        }
      } catch (e) {
        console.error("Error fetching top agent:", e);
      }

      // Fetch all tickets to analyze common issues this week
      try {
        const allTicketsRes = await fetch("/api/tickets");
        const allTicketsData = await allTicketsRes.json();
        const allTickets = allTicketsData.tickets || [];

        // Filter tickets from this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weekTickets = allTickets.filter((t: any) => {
          const created = new Date(t.created_at);
          return created >= oneWeekAgo;
        });

        // Group by subject to find common issues
        const issueCounts: Record<string, number> = {};
        weekTickets.forEach((t: any) => {
          const subject = t.subject || "Other";
          issueCounts[subject] = (issueCounts[subject] || 0) + 1;
        });

        // Get top 3 issues
        const top3Issues = Object.entries(issueCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([subject, count]) => ({
            subject,
            count,
            percentage: weekTickets.length > 0 ? Math.round((count / weekTickets.length) * 100) : 0,
          }));

        setCommonIssues(top3Issues);
      } catch (e) {
        console.error("Error fetching common issues:", e);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, dateFilter, customDateFrom, customDateTo]);

  const handleAddUser = async (data: UserFormData) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) toast.success("User created!");
      else toast.error("Failed to create user");
      fetchData();
    } catch {
      toast.error("Network error");
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffMs / 86400000)} days ago`;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "senior":
        return "shield_person";
      case "junior":
        return "person";
      case "it":
        return "build";
      default:
        return "person";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "senior":
        return "bg-[#EB4C36]/10 text-[#EB4C36]";
      case "junior":
        return "bg-emerald-500/10 text-emerald-500";
      case "it":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "senior":
        return "Senior CS Agent";
      case "junior":
        return "Junior CS Agent";
      case "it":
        return "IT Support Staff";
      default:
        return role;
    }
  };

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <>
      <style>{`
        .admin-ticket-list::-webkit-scrollbar {
          width: 6px;
        }
        .admin-ticket-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-ticket-list::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .admin-ticket-list::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Panel - Stats */}
        <div className="flex-[2] flex flex-col gap-6 min-w-0 h-full">
          {/* System Stats with Period Dropdown */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-soft p-4 text-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold opacity-90">System Overview</p>
              </div>
              <CustomSelect
                value={dateFilter}
                onChange={(val) => setDateFilter(val as "week" | "month" | "year")}
                options={[
                  { value: "week", label: "This Week" },
                  { value: "month", label: "This Month" },
                  { value: "year", label: "This Year" },
                ]}
                variant="filter-overlay"
              />
            </div>
            {dateFilter === "custom" && (
              <div className="flex items-center gap-2 mb-3">
                <input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} className="px-2 py-1 border border-white/30 rounded text-xs text-slate-900" />
                <span className="text-white/50">→</span>
                <input type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} className="px-2 py-1 border border-white/30 rounded text-xs text-slate-900" />
              </div>
            )}
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold">{isLoading ? "..." : stats.total}</span>
              <span className="text-lg font-bold opacity-70 mb-0.5">tickets</span>
            </div>
            <p className="text-xs opacity-80 mt-1.5">📊 Total tickets in system</p>
            <div className="grid grid-cols-4 gap-2 mt-4">
              <div className="bg-white/15 rounded-lg px-3 py-2">
                <p className="text-lg font-extrabold leading-none">{isLoading ? "..." : stats.open}</p>
                <p className="text-[10px] uppercase tracking-wide opacity-80 mt-1">Open Tickets</p>
              </div>
              <div className="bg-white/15 rounded-lg px-3 py-2">
                <p className="text-lg font-extrabold leading-none">{isLoading ? "..." : stats.inProgress}</p>
                <p className="text-[10px] uppercase tracking-wide opacity-80 mt-1">In Progress</p>
              </div>
              <div className="bg-white/15 rounded-lg px-3 py-2">
                <p className="text-lg font-extrabold leading-none">{isLoading ? "..." : stats.resolved}</p>
                <p className="text-[10px] uppercase tracking-wide opacity-80 mt-1">Resolved</p>
              </div>
              <div className="bg-white/15 rounded-lg px-3 py-2">
                <p className="text-lg font-extrabold leading-none">{isLoading ? "..." : stats.withIT}</p>
                <p className="text-[10px] uppercase tracking-wide opacity-80 mt-1">With IT</p>
              </div>
            </div>
          </div>

          {/* Weekly Insights Panel */}
          <div className="bg-white rounded-lg shadow-soft p-4">
            <h2 className="text-base font-bold text-slate-900 mb-3">Weekly Insights</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Left: Top Agent This Week */}
              <div className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🏆</span>
                  <p className="text-xs font-bold text-slate-700">Top Agent This Week</p>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <span className="size-4 border border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                  </div>
                ) : topAgent ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{topAgent.name}</p>
                      <p className="text-[11px] text-slate-500 capitalize">{getRoleLabel(topAgent.role)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded p-2 text-center">
                        <p className="text-lg font-extrabold text-slate-900">{topAgent.metrics?.completed || 0}</p>
                        <p className="text-[9px] text-slate-500 uppercase mt-0.5">Completed</p>
                      </div>
                      <div className="bg-slate-50 rounded p-2 text-center">
                        <p className="text-lg font-extrabold text-slate-900">{topAgent.metrics?.score || "-"}</p>
                        <p className="text-[9px] text-slate-500 uppercase mt-0.5">Score</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No activity this week</p>
                )}
              </div>

              {/* Right: Common Issues This Week */}
              <div className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📊</span>
                  <p className="text-xs font-bold text-slate-700">Common Issues This Week</p>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <span className="size-4 border border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                  </div>
                ) : commonIssues.length > 0 ? (
                  <div className="space-y-2">
                    {commonIssues.map((issue, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[11px] font-medium text-slate-700 line-clamp-1">{issue.subject}</p>
                          <p className="text-[11px] font-bold text-slate-600 flex-shrink-0 ml-2">{issue.percentage}%</p>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${index === 0 ? "bg-red-500" : index === 1 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${issue.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No issues this week</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <h2 className="text-base font-bold text-slate-900 mb-2">Unassigned Tickets</h2>
            <div className="flex-1 bg-white rounded-lg shadow-soft p-4 overflow-hidden">
              <div className="h-full overflow-y-auto space-y-2 admin-ticket-list" style={{ scrollbarWidth: "thin" }}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <span className="size-4 border border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                  </div>
                ) : unassignedTickets.length === 0 ? (
                  <div className="text-center text-slate-400 py-4">
                    <span className="material-symbols-outlined text-3xl mb-1 block">check_circle</span>
                    <p className="text-xs">All tickets have been assigned</p>
                  </div>
                ) : (
                  unassignedTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-slate-50 hover:bg-slate-100 p-2.5 rounded border border-slate-100 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-xs">
                            #{ticket.number} - {ticket.subject}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{ticket.description || "No description"}</p>
                        </div>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap flex-shrink-0 ${
                            ticket.priority === "HIGH" ? "bg-red-50 text-red-600" : ticket.priority === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{ticket.customer_name}</span>
                        <span>{formatTimeAgo(ticket.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[360px] flex flex-col gap-3 min-w-0 h-full overflow-hidden">
          {/* System Activity */}
          <div className="flex-1 bg-white rounded-lg shadow-soft flex flex-col overflow-hidden min-h-0">
            <div className="p-4 pb-3 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <span className="material-symbols-outlined text-slate-400 text-base">history</span>
                System Activity
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <span className="size-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                </div>
              ) : activities.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-900">{activity.details}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatTimeAgo(activity.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)} onSubmit={handleAddUser} />
    </>
  );
}
