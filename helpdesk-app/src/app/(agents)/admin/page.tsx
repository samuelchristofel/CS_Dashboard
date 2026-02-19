"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import StatCard from "@/components/dashboard/StatCard";
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
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">System overview and management</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{today}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Panel - Stats */}
        <div className="flex-[2] flex flex-col gap-6 min-w-0 h-full">
          {/* System Stats */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-soft p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold opacity-90">System Overview</p>
                <p className="text-xs opacity-70">Current statistics</p>
              </div>
              <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-extrabold">{isLoading ? "..." : stats.total}</span>
              <span className="text-2xl font-bold opacity-70 mb-1">tickets</span>
            </div>
            <p className="text-sm opacity-80 mt-2">📊 Total tickets in system</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard value={stats.open} label="Open Tickets" color="primary" bordered />
            <StatCard value={stats.inProgress} label="In Progress" color="blue" />
            <StatCard value={stats.resolved} label="Resolved" color="green" />
            <StatCard value={stats.withIT} label="With IT" color="amber" />
          </div>

          {/* Team Stats */}
          <div className="flex-1 flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Team Performance</h2>
            <div className="flex-1 bg-white rounded-lg shadow-soft p-6 overflow-hidden">
              <div className="h-full overflow-y-auto no-scrollbar space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="size-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className={`size-12 rounded-full flex items-center justify-center ${getRoleColor(user.role)}`}>
                        <span className="material-symbols-outlined">{getRoleIcon(user.role)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{getRoleLabel(user.role)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">Active</p>
                        <p className="text-xs text-green-500">Online</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[450px] flex flex-col gap-4 min-w-0 h-full overflow-hidden">
          {/* Admin Actions */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              Admin Actions
            </div>
            <div className="bg-white p-6 rounded-lg shadow-soft">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowAddUserModal(true)} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-slate-600">person_add</span>
                  <span className="text-xs font-medium text-slate-600">Add User</span>
                </button>
                <button onClick={() => router.push("/admin/reports")} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-slate-600">analytics</span>
                  <span className="text-xs font-medium text-slate-600">Reports</span>
                </button>
                <button onClick={() => router.push("/admin/users")} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-slate-600">group</span>
                  <span className="text-xs font-medium text-slate-600">Users</span>
                </button>
                <button onClick={() => router.push("/admin/audit")} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-slate-600">security</span>
                  <span className="text-xs font-medium text-slate-600">Audit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="flex-1 bg-white rounded-lg shadow-soft flex flex-col overflow-hidden min-h-0">
            <div className="p-6 pb-4 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <span className="material-symbols-outlined text-slate-400 text-lg">history</span>
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
