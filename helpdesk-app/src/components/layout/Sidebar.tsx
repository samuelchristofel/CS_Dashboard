"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUnreadNotifications } from "@/components/providers/UnreadNotificationProvider";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  role: UserRole;
  userName: string;
  userTitle: string;
  userAvatar?: string;
}

const navItemsByRole: Record<UserRole, NavItem[]> = {
  senior: [
    { label: "Dashboard", href: "/senior", icon: "grid_view" },
    { label: "Tickets", href: "/senior/tickets", icon: "confirmation_number" },
    { label: "Reports", href: "/senior/reports", icon: "bar_chart" },
    { label: "Notifikasi", href: "/senior/history", icon: "notifications" },
  ],
  junior: [
    { label: "Dashboard", href: "/junior", icon: "grid_view" },
    { label: "Tickets", href: "/junior/tickets", icon: "confirmation_number" },
    { label: "Reports", href: "/junior/reports", icon: "bar_chart" },
    { label: "Notifikasi", href: "/junior/history", icon: "notifications" },
  ],
  it: [
    { label: "Dashboard", href: "/it", icon: "grid_view" },
    { label: "Tickets", href: "/it/tickets", icon: "confirmation_number" },
    { label: "Notifikasi", href: "/it/history", icon: "notifications" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: "grid_view" },
    { label: "Tickets", href: "/admin/tickets", icon: "confirmation_number" },
    { label: "Users", href: "/admin/users", icon: "people" },
    { label: "Reports", href: "/admin/reports", icon: "bar_chart" },
    { label: "Analytics", href: "/admin/analytics", icon: "analytics" },
    { label: "Audit Logs", href: "/admin/audit", icon: "security" },
    { label: "History", href: "/admin/history", icon: "history" },
  ],
};

const roleColors: Record<UserRole, string> = {
  senior: "bg-[#EB4C36] shadow-[#EB4C36]/30",
  junior: "bg-[#EB4C36] shadow-[#EB4C36]/30",
  it: "bg-blue-500 shadow-blue-500/30",
  admin: "bg-slate-900 shadow-slate-900/30",
};

export default function Sidebar({ role, userName, userTitle, userAvatar }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[role];
  const logoColor = roleColors[role];
  const { unreadCount, refreshUnreadCount } = useUnreadNotifications();

  useEffect(() => {
    refreshUnreadCount();
    const intervalId = setInterval(refreshUnreadCount, 15000);
    return () => clearInterval(intervalId);
  }, [refreshUnreadCount]);

  const isActive = (href: string, label: string) => {
    // For Dashboard and History, exact match only (not subpages)
    if (label === "Dashboard" || label === "History" || label === "Notifikasi") return pathname === href;

    // For other pages, use startsWith for nested routes
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 flex-shrink-0 flex flex-col h-full bg-transparent">
      {/* Logo */}
      <div className="h-16 flex items-center px-2 mb-8">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-full ${logoColor} flex items-center justify-center text-white shadow-lg`}>
            <span className="material-symbols-outlined text-2xl">{role === "admin" ? "admin_panel_settings" : role === "it" ? "build" : "support_agent"}</span>
          </div>
          <h1 className="text-slate-900 text-xl font-bold tracking-tight">{role === "admin" ? "Admin Panel" : "HelpDesk"}</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.href, item.label);
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all ${active ? "bg-white text-slate-900 shadow-soft" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"}`}>
              <span className="relative inline-flex">
                <span className={`material-symbols-outlined text-2xl ${active ? "text-[#EB4C36]" : ""}`} style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {item.icon}
                </span>
                {item.label === "Notifikasi" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </span>
              <span className={`text-base ${active ? "font-bold" : "font-semibold"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="mt-auto">
        <div className="flex items-center gap-3 p-2 pr-4 bg-white rounded-full shadow-soft cursor-pointer">
          {userAvatar ? (
            <div className="size-10 rounded-full bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url('${userAvatar}')` }} />
          ) : (
            <div className={`size-10 rounded-full ${logoColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 leading-tight truncate">{userName}</p>
            <p className="text-[10px] text-slate-500 font-medium truncate">{userTitle}</p>
          </div>
          <Link href="/login" className="flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-[#EB4C36] leading-none">logout</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
