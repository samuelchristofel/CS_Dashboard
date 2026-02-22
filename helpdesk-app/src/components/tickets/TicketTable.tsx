"use client";

import { useMemo, useState } from "react";
import type { Priority, TicketStatus } from "@/types";

interface TicketRow {
  id: string;
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerPhone?: string;
  priority: Priority;
  status: TicketStatus;
  source: "Freshchat" | "WhatsApp" | "Email" | "Phone";
  assignedTo?: {
    name: string;
    avatar?: string;
    initials: string;
    role?: string;
  };
  createdAt: string;
  createdAtTimestamp?: number;
  updatedAt?: string;
  updatedAtTimestamp?: number;
  lastUpdate?: string;
  lastUpdateTimestamp?: number;
  onView?: () => void;
  onAssign?: () => void;
}

interface TicketTableProps {
  tickets: TicketRow[];
  showAssignedTo?: boolean;
  showSource?: boolean;
  onViewTicket?: (ticketId: string) => void;
  onEditTicket?: (ticketId: string) => void;
  onAssignTicket?: (ticketId: string) => void;
}

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-red-50 text-red-500",
  MEDIUM: "bg-amber-50 text-amber-600",
  LOW: "bg-green-50 text-green-600",
};

const statusColors: Record<TicketStatus, string> = {
  OPEN: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border border-blue-200",
  RESOLVED: "bg-green-100 text-green-600",
  CLOSED: "bg-green-100 text-green-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  WITH_IT: "bg-blue-100 text-blue-700",
};

const sourceColors = {
  Freshchat: "bg-purple-50 text-purple-600",
  WhatsApp: "bg-green-50 text-green-600",
  Email: "bg-blue-50 text-blue-600",
  Phone: "bg-slate-100 text-slate-600",
};

export default function TicketTable({ tickets, showAssignedTo = true, showSource = true, onViewTicket, onEditTicket, onAssignTicket }: TicketTableProps) {
  const [sortField, setSortField] = useState<"created" | "lastUpdate" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const parseDate = (value?: string) => {
    if (!value) return 0;
    const ts = new Date(value).getTime();
    return Number.isNaN(ts) ? 0 : ts;
  };

  const getCreatedTs = (ticket: TicketRow) => ticket.createdAtTimestamp ?? parseDate(ticket.createdAt);

  const getLastUpdateTs = (ticket: TicketRow) => {
    const explicitTs = ticket.lastUpdateTimestamp ?? ticket.updatedAtTimestamp;
    if (explicitTs && explicitTs > 0) return explicitTs;

    const parsedTs = parseDate(ticket.lastUpdate) || parseDate(ticket.updatedAt);
    return parsedTs || getCreatedTs(ticket);
  };

  const formatLastUpdate = (ticket: TicketRow) => {
    const ts = getLastUpdateTs(ticket);
    if (!ts) return ticket.createdAt;

    const diffMs = Date.now() - ts;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs >= 0 && diffHrs < 24) {
      return `${diffHrs}h ago`;
    }

    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const sortedTickets = useMemo(() => {
    if (!sortField || !sortDirection) return tickets;

    const ordered = [...tickets].sort((a, b) => {
      const aTs = sortField === "created" ? getCreatedTs(a) : getLastUpdateTs(a);
      const bTs = sortField === "created" ? getCreatedTs(b) : getLastUpdateTs(b);
      return sortDirection === "asc" ? aTs - bTs : bTs - aTs;
    });

    return ordered;
  }, [tickets, sortField, sortDirection]);

  const toggleSort = (field: "created" | "lastUpdate") => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
      return;
    }

    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }

    if (sortDirection === "desc") {
      setSortField(null);
      setSortDirection(null);
      return;
    }

    setSortDirection("asc");
  };

  const renderSortIcon = (field: "created" | "lastUpdate") => {
    const isActive = sortField === field;
    const upActive = isActive && sortDirection === "asc";
    const downActive = isActive && sortDirection === "desc";

    return (
      <span className="flex flex-col -space-y-2 ml-1">
        <span className={`material-symbols-outlined text-sm leading-none ${upActive ? "text-slate-700" : "text-slate-300"}`}>arrow_drop_up</span>
        <span className={`material-symbols-outlined text-sm leading-none ${downActive ? "text-slate-700" : "text-slate-300"}`}>arrow_drop_down</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-soft flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-400 uppercase">
        <div className="w-20">Ticket</div>
        <div className="flex-1 max-w-[280px]">Subject</div>
        <div className="w-20">Priority</div>
        <div className="w-28">Status</div>
        {showAssignedTo && <div className="w-28">Assigned To</div>}
        {showSource && <div className="w-20">Source</div>}
        <button type="button" onClick={() => toggleSort("created")} className="w-28 flex items-center uppercase text-xs font-bold text-slate-400">
          Created
          {renderSortIcon("created")}
        </button>
        <button type="button" onClick={() => toggleSort("lastUpdate")} className="w-28 flex items-center uppercase text-xs font-bold text-slate-400">
          Last Update
          {renderSortIcon("lastUpdate")}
        </button>
        <div className="w-24 text-right">Actions</div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {sortedTickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`px-6 py-4 border-b border-slate-50 flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${
              ticket.status === "CLOSED" ? "opacity-60" : ""
            } ${ticket.status === "WITH_IT" ? "border-l-4 border-blue-500" : ""}`}
          >
            <div className="w-20 text-xs font-mono font-bold text-slate-400">#{ticket.ticketNumber}</div>
            <div className="flex-1 max-w-[280px] min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate" title={ticket.subject}>
                {ticket.subject}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 truncate" title={`${ticket.customerName}${ticket.customerPhone ? ` • ${ticket.customerPhone}` : ""}`}>
                {ticket.customerName} {ticket.customerPhone && `• ${ticket.customerPhone}`}
              </p>
            </div>
            <div className="w-20">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
            </div>
            <div className="w-28">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusColors[ticket.status]}`}>{ticket.status.replace("_", " ")}</span>
            </div>
            {showAssignedTo && (
              <div className="w-28">
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-2">
                    {ticket.assignedTo.avatar ? (
                      <div className="size-6 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${ticket.assignedTo.avatar}')` }} />
                    ) : (
                      <div className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${ticket.assignedTo.role === "IT" ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-600"}`}>
                        {ticket.assignedTo.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-600 leading-tight">{ticket.assignedTo.initials}</p>
                      {ticket.assignedTo.role && <p className="text-[10px] text-slate-400 leading-tight">{ticket.assignedTo.role === "IT" ? "IT Support" : ticket.assignedTo.role}</p>}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>
            )}
            {showSource && (
              <div className="w-20">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${sourceColors[ticket.source]}`}>{ticket.source}</span>
              </div>
            )}
            <div className="w-28 text-xs text-slate-500">{ticket.createdAt}</div>
            <div className="w-28 text-xs text-slate-500">{formatLastUpdate(ticket)}</div>
            <div className="w-24 flex justify-end gap-1">
              <button onClick={() => onViewTicket?.(ticket.id)} className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200" title="View">
                <span className="material-symbols-outlined text-sm">visibility</span>
              </button>
              {onEditTicket && (
                <button onClick={() => onEditTicket?.(ticket.id)} className="size-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100" title="Edit">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              )}
              {!ticket.assignedTo && onAssignTicket && (
                <button onClick={() => onAssignTicket?.(ticket.id)} className="size-7 rounded-full bg-[#EB4C36]/10 flex items-center justify-center text-[#EB4C36] hover:bg-[#EB4C36]/20" title="Assign">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing 1-{tickets.length} of {tickets.length} tickets
        </p>
        <div className="flex items-center gap-2">
          <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button className="size-8 rounded-full bg-[#EB4C36] text-white flex items-center justify-center font-bold text-sm">1</button>
          <button className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
