"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

interface TicketDetail {
  id: string;
  number: string;
  subject: string;
  description?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: string;
  source: "Freshchat" | "WhatsApp" | "Email" | "Phone" | string;
  created_at: string;
  updated_at: string;
  assigned_to_id?: string | null;
  assigned_to?: {
    id: string;
    name: string;
    role: string;
    avatar?: string | null;
  } | null;
  notes?: {
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      name: string;
      role?: string;
    };
  }[];
}

interface ActivityItem {
  id: string;
  action: string;
  details?: string | null;
  created_at: string;
}

interface SessionUser {
  id: string;
  role: "admin" | "senior" | "junior" | "it";
  name: string;
}

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
}

const priorityColors: Record<TicketDetail["priority"], string> = {
  HIGH: "bg-red-50 text-red-600 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-600 border-amber-200",
  LOW: "bg-green-50 text-green-600 border-green-200",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border border-blue-200",
  RESOLVED: "bg-green-100 text-green-600",
  CLOSED: "bg-green-100 text-green-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  WITH_IT: "bg-blue-100 text-blue-700",
};

const sourceColors: Record<string, string> = {
  Freshchat: "bg-purple-50 text-purple-600",
  WhatsApp: "bg-green-50 text-green-600",
  Email: "bg-blue-50 text-blue-600",
  Phone: "bg-slate-100 text-slate-600",
};

const sectionLabelClass = "text-[10px] uppercase tracking-[0.12em] font-bold text-slate-400";

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseNoteContent(raw: string) {
  try {
    const parsed = JSON.parse(raw) as { title?: string; content?: string };
    return parsed.content?.trim() || parsed.title?.trim() || raw;
  } catch {
    return raw;
  }
}

function getRoleLabel(role?: string) {
  if (!role) return "Unassigned";
  if (role === "senior") return "Senior CS";
  if (role === "junior") return "Junior CS";
  if (role === "it") return "IT Support";
  if (role === "admin") return "Admin";
  return role;
}

export default function TicketDetailModal({ isOpen, onClose, ticketId }: TicketDetailModalProps) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [itUserId, setItUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SessionUser;
      setUser(parsed);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setIsVisible(false);
    const timer = setTimeout(() => setIsMounted(false), 220);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const fetchTicket = async () => {
    if (!ticketId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch ticket");
      const data = await res.json();
      setTicket(data.ticket || null);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error("Failed to load ticket details");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!ticketId) return;
    try {
      const res = await fetch(`/api/activities?ticket_id=${ticketId}&limit=100`);
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();
      setActivities((data.activities || []).slice().reverse());
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    }
  };

  const fetchItAssignee = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) return;
      const data = await res.json();
      const itUser = (data.users || []).find((u: { role: string }) => u.role === "it");
      setItUserId(itUser?.id || null);
    } catch {
      setItUserId(null);
    }
  };

  useEffect(() => {
    if (!isOpen || !ticketId) {
      setTicket(null);
      setActivities([]);
      setNoteDraft("");
      setIsAddNoteOpen(false);
      return;
    }
    fetchTicket();
    fetchActivities();
    fetchItAssignee();
  }, [isOpen, ticketId]);

  const refreshPanelData = async () => {
    await Promise.all([fetchTicket(), fetchActivities()]);
  };

  const updateTicket = async (payload: Record<string, string>) => {
    if (!ticketId || !user?.id) {
      toast.error("User session not found");
      return;
    }
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, user_id: user.id }),
      });
      if (!res.ok) throw new Error("Failed to update ticket");
      await refreshPanelData();
      toast.success("Ticket updated");
    } catch (error) {
      console.error("Update ticket error:", error);
      toast.error("Failed to update ticket");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!ticketId || !user?.id || !noteDraft.trim()) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Note",
          content: noteDraft.trim(),
          user_id: user.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      setNoteDraft("");
      setIsAddNoteOpen(false);
      await refreshPanelData();
      toast.success("Note added");
    } catch (error) {
      console.error("Add note error:", error);
      toast.error("Failed to add note");
    } finally {
      setIsActionLoading(false);
    }
  };

  const canAssignToCs = useMemo(() => {
    if (!ticket || !user) return false;
    return !ticket.assigned_to_id && (user.role === "admin" || user.role === "senior" || user.role === "junior") && ticket.status !== "CLOSED";
  }, [ticket, user]);

  const canResolve = useMemo(() => {
    if (!ticket || !user) return false;
    return user.role !== undefined && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED";
  }, [ticket, user]);

  const canEscalate = useMemo(() => {
    if (!ticket || !user) return false;
    return (user.role === "admin" || user.role === "senior" || user.role === "junior") && ticket.status !== "WITH_IT" && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED";
  }, [ticket, user]);

  const canClose = useMemo(() => {
    if (!ticket || !user) return false;
    return (user.role === "admin" || user.role === "senior") && ticket.status !== "CLOSED";
  }, [ticket, user]);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close ticket detail"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/45 transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        className={`absolute right-0 top-0 h-screen w-[680px] bg-white shadow-2xl transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "translate-x-full"} text-[13px] leading-[1.5]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200/70">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-bold text-slate-900">{ticket ? `#${ticket.number}` : "Ticket"}</p>
                {ticket && <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>}
                {ticket && <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColors[ticket.status] || "bg-slate-100 text-slate-600"}`}>{ticket.status.replace(/_/g, " ")}</span>}
              </div>
              <button type="button" onClick={onClose} className="size-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <p className="mt-3 text-[16px] font-semibold text-slate-900">{ticket?.subject || "Loading ticket..."}</p>
            {ticket && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-slate-500">
                <span>{ticket.customer_name}</span>
                {ticket.customer_phone && <span>&middot; {ticket.customer_phone}</span>}
                <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${sourceColors[ticket.source] || "bg-slate-100 text-slate-600"}`}>{ticket.source}</span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="size-8 border-2 border-slate-200 border-t-[#EB4C36] rounded-full animate-spin" />
            </div>
          ) : ticket ? (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="grid grid-cols-[3fr_2fr] gap-6">
                <div className="space-y-4">
                  <section>
                    <p className={sectionLabelClass}>Ticket Details</p>
                    <div className="mt-2 space-y-2 text-slate-700">
                      <p>
                        <span className="text-slate-500">Created:</span> {formatDateTime(ticket.created_at)}
                      </p>
                      <p>
                        <span className="text-slate-500">Last Update:</span> {formatDateTime(ticket.updated_at)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Assigned To:</span>
                        {ticket.assigned_to ? (
                          <div className="flex items-center gap-2">
                            {ticket.assigned_to.avatar ? (
                              <div className="size-6 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${ticket.assigned_to.avatar}')` }} />
                            ) : (
                              <div className="size-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                {ticket.assigned_to.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                            )}
                            <span>
                              {ticket.assigned_to.name} ({getRoleLabel(ticket.assigned_to.role)})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </div>
                      <p>
                        <span className="text-slate-500">Issue Type:</span> {ticket.subject}
                      </p>
                    </div>
                  </section>

                  <hr className="border-slate-200" />

                  <section>
                    <p className={sectionLabelClass}>Description</p>
                    <p className="mt-2 text-slate-700 whitespace-pre-wrap">{ticket.description?.trim() || "No description provided"}</p>
                  </section>

                  <hr className="border-slate-200" />

                  <section>
                    <p className={sectionLabelClass}>Notes</p>
                    <div className="mt-2 space-y-2">
                      {ticket.notes && ticket.notes.length > 0 ? (
                        ticket.notes.map((note) => (
                          <div key={note.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
                              <span className="font-semibold text-slate-700">{note.user.name}</span>
                              <span>{formatDateTime(note.created_at)}</span>
                            </div>
                            <p className="mt-1 text-slate-700 whitespace-pre-wrap">{parseNoteContent(note.content)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400">No notes yet</p>
                      )}
                    </div>

                    {isAddNoteOpen && (
                      <div className="mt-3 rounded-lg border border-slate-200 p-3 bg-white">
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          rows={4}
                          placeholder="Write your note..."
                          className="w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EB4C36]/20"
                        />
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button type="button" onClick={() => setIsAddNoteOpen(false)} className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200">
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddNote}
                            disabled={isActionLoading || !noteDraft.trim()}
                            className="px-3 py-1.5 rounded-md bg-[#EB4C36] text-white hover:bg-[#d13a25] disabled:opacity-50"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    )}
                  </section>

                  <hr className="border-slate-200" />

                  <section>
                    <p className={sectionLabelClass}>Audit Timeline</p>
                    <div className="mt-2 space-y-2">
                      {activities.length > 0 ? (
                        activities.map((item) => (
                          <div key={item.id} className="grid grid-cols-[120px_1fr] gap-3 text-[12px] text-slate-500">
                            <div className="flex items-start gap-2">
                              <span className="mt-1 size-2 rounded-full bg-slate-300" />
                              <span>{formatDateTime(item.created_at)}</span>
                            </div>
                            <p className="text-slate-600">{item.details || item.action.replace(/_/g, " ")}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400">No activity yet</p>
                      )}
                    </div>
                  </section>
                </div>

                <div>
                  <section className="sticky top-0 space-y-2">
                    <p className={sectionLabelClass}>Actions</p>

                    <button
                      type="button"
                      onClick={() => setIsAddNoteOpen((prev) => !prev)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Add Note
                    </button>

                    {canAssignToCs && (
                      <button
                        type="button"
                        onClick={() => updateTicket({ assigned_to_id: user!.id, status: "IN_PROGRESS" })}
                        disabled={isActionLoading}
                        className="w-full rounded-lg bg-blue-500 text-white px-3 py-2 hover:bg-blue-600 disabled:opacity-50"
                      >
                        Assign to CS
                      </button>
                    )}

                    {canResolve && (
                      <button
                        type="button"
                        onClick={() => updateTicket({ status: "RESOLVED" })}
                        disabled={isActionLoading}
                        className="w-full rounded-lg bg-emerald-500 text-white px-3 py-2 hover:bg-emerald-600 disabled:opacity-50"
                      >
                        Mark as Resolved
                      </button>
                    )}

                    {canEscalate && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!itUserId) {
                            toast.error("No IT support user found");
                            return;
                          }
                          updateTicket({ status: "WITH_IT", assigned_to_id: itUserId });
                        }}
                        disabled={isActionLoading}
                        className="w-full rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 disabled:opacity-50"
                      >
                        Escalate to IT Support
                      </button>
                    )}

                    {canClose && (
                      <button
                        type="button"
                        onClick={() => updateTicket({ status: "CLOSED" })}
                        disabled={isActionLoading}
                        className="w-full rounded-lg bg-red-500 text-white px-3 py-2 hover:bg-red-600 disabled:opacity-50"
                      >
                        Close Ticket
                      </button>
                    )}
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">Ticket not found</div>
          )}
        </div>
      </aside>
    </div>
  );
}
