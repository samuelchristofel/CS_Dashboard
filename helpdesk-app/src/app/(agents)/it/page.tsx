"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import ScoreCard from "@/components/dashboard/ScoreCard";
import TicketCard from "@/components/dashboard/TicketCard";
import AddNoteModal from "@/components/modals/AddNoteModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Ticket {
  id: string;
  number: string;
  subject: string;
  description: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: string;
  customer_name: string;
  created_at: string;
  created_by?: {
    name: string;
  };
}

interface Activity {
  id: string;
  action: string;
  details: string;
  created_at: string;
  user?: { name: string };
}
interface Note {
  id: string;
  content: string;
  created_at: string;
}

export default function ITDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [stats, setStats] = useState({ assigned: 0, pending: 0, resolved: 0 });
  const [userScore, setUserScore] = useState(0);
  const [periodFilter, setPeriodFilter] = useState<"week" | "month" | "year">("month");

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketActivities, setTicketActivities] = useState<Activity[]>([]);
  const [latestNote, setLatestNote] = useState<Note | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFixedModal, setShowFixedModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Filter tickets by priority
  const filteredTickets = priorityFilter === "all" ? tickets : tickets.filter((t) => t.priority === priorityFilter);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || "User");
      setUserId(user.id || "");
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    setIsLoadingData(true);
    try {
      // Fetch tickets with IT status or assigned to IT user
      const ticketsRes = await fetch(`/api/tickets?status=WITH_IT`);
      const ticketsData = await ticketsRes.json();

      const myTickets = (ticketsData.tickets || []).filter((t: { assigned_to_id?: string; status: string }) => t.assigned_to_id === userId || t.status === "WITH_IT");
      setTickets(myTickets);

      const statsRes = await fetch(`/api/stats?user_id=${userId}&role=it&period=${periodFilter}`);
      const statsData = await statsRes.json();
      if (statsData.userStats) {
        setUserScore(statsData.userStats.closed);
        setStats({
          assigned: statsData.userStats.active,
          pending: myTickets.filter((t: { status: string }) => t.status === "WITH_IT").length,
          resolved: statsData.userStats.closed,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [userId, periodFilter]);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  // Handle default selection
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    }
  }, [tickets, selectedTicket]);

  // Update selected ticket data when tickets refresh
  useEffect(() => {
    if (selectedTicket && tickets.length > 0) {
      const updated = tickets.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets]);

  // Fetch details for selected ticket
  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!selectedTicket) return;
      try {
        // Fetch activities
        const activitiesRes = await fetch(`/api/activities?ticket_id=${selectedTicket.id}&limit=10`);
        const activitiesData = await activitiesRes.json();
        setTicketActivities(activitiesData.activities || []);

        // Fetch notes
        const notesRes = await fetch(`/api/tickets/${selectedTicket.id}/notes`);
        const notesData = await notesRes.json();
        if (notesData.notes && notesData.notes.length > 0) {
          setLatestNote(notesData.notes[0]);
        } else {
          setLatestNote(null);
        }
      } catch (error) {
        console.error("Error fetching ticket details:", error);
      }
    };

    fetchTicketDetails();
  }, [selectedTicket]);

  const handleAddNote = async (note: string) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note, user_id: userId }),
      });
      if (res.ok) {
        toast.success("Technical note added!");
        // Refresh notes immediately
        const notesRes = await fetch(`/api/tickets/${selectedTicket.id}/notes`);
        const notesData = await notesRes.json();
        if (notesData.notes && notesData.notes.length > 0) {
          setLatestNote(notesData.notes[0]);
        }
      }
      fetchData();
    } catch {
      toast.error("Failed to add note");
    }
  };

  const handleMarkFixed = async () => {
    if (!selectedTicket) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED", user_id: userId }),
      });
      if (res.ok) toast.success("Ticket marked as fixed!");
      fetchData();
    } catch {
      toast.error("Failed to update ticket");
    }

    setIsLoading(false);
    setShowFixedModal(false);
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffMs / 86400000)}d ago`;
  };

  const getActivityColor = (action: string) => {
    if (action.includes("CLOSED") || action.includes("RESOLVED")) return "green";
    if (action.includes("ESCALATED") || action.includes("IT")) return "blue";
    if (action.includes("ASSIGNED")) return "amber";
    return "slate";
  };

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <>
      <style>{`
        .it-ticket-list::-webkit-scrollbar {
          width: 6px;
        }
        .it-ticket-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .it-ticket-list::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .it-ticket-list::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName}! 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Here&apos;s your performance summary</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{today}</span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-[1.2] flex flex-col gap-6 overflow-hidden">
          <ScoreCard
            role="it"
            userName={userName}
            score={userScore}
            message="🔧 Technical tickets resolved this month"
            periodFilter={periodFilter}
            onPeriodChange={setPeriodFilter}
            compactStats={[
              { label: "Assigned to Me", value: stats.assigned },
              { label: "Pending", value: stats.pending },
              { label: "Fixed This Month", value: stats.resolved },
            ]}
            compactStatsVariant="overlay"
          />

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">Technical Tickets</h2>
                {priorityFilter !== "all" && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${priorityFilter === "HIGH" ? "bg-red-50 text-red-600" : priorityFilter === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}>
                    {priorityFilter}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  const priorities = ["all", "HIGH", "MEDIUM", "LOW"];
                  const currentIndex = priorities.indexOf(priorityFilter);
                  const nextIndex = (currentIndex + 1) % priorities.length;
                  setPriorityFilter(priorities[nextIndex]);
                }}
                className={`size-8 rounded-full flex items-center justify-center transition-colors ${priorityFilter !== "all" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              >
                <span className="material-symbols-outlined text-lg">tune</span>
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-3 p-1 it-ticket-list" style={{ scrollbarWidth: "thin" }}>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <span className="size-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">engineering</span>
                  <p>{priorityFilter !== "all" ? `No ${priorityFilter.toLowerCase()} priority tickets` : "No technical tickets"}</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticketNumber={ticket.number}
                    subject={ticket.subject}
                    description={ticket.description || ""}
                    priority={ticket.priority}
                    status={ticket.status as "WITH_IT" | "IN_PROGRESS"}
                    customerName={ticket.customer_name}
                    customerInitials={ticket.customer_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                    timeAgo={formatTimeAgo(ticket.created_at)}
                    selected={selectedTicket?.id === ticket.id}
                    accentColor="#3B82F6"
                    onClick={() => setSelectedTicket(ticket)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="w-[450px] flex flex-col gap-4 min-w-0 overflow-hidden">
          <div className="flex-1 bg-white rounded-lg shadow-soft flex flex-col overflow-hidden min-h-0">
            {selectedTicket ? (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold">Ticket #{selectedTicket.number}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        selectedTicket.priority === "HIGH" ? "bg-red-50 text-red-600" : selectedTicket.priority === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                      }`}
                    >
                      {!selectedTicket.priority.startsWith("!") ? (selectedTicket.priority === "HIGH" ? "! " : "") : ""}
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{selectedTicket.status.replace("_", " ")}</span>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                  {/* Quick Info Grid */}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    <span className="material-symbols-outlined text-base">info</span>
                    Ticket Details
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Issue Type</p>
                      <p className="text-sm font-semibold text-slate-700 mt-1 truncate">{selectedTicket.subject}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Customer</p>
                      <p className="text-sm font-semibold text-slate-700 mt-1 truncate">{selectedTicket.customer_name}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned By</p>
                      <p className="text-sm font-semibold text-slate-700 mt-1 truncate">{selectedTicket.created_by?.name || "System"}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
                      <p className="text-sm font-semibold text-blue-600 mt-1">Technical Issue</p>
                    </div>
                  </div>

                  {/* Technical Notes */}
                  {latestNote && (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-2">My/Latest Note</p>
                      <p className="text-sm text-slate-600">{latestNote.content}</p>
                    </div>
                  )}

                  {/* Audit Timeline */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      <span className="material-symbols-outlined text-slate-400 text-lg">history</span>
                      Audit Timeline
                    </div>
                    <div className="relative pl-4 space-y-6 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                      {ticketActivities.map((activity) => (
                        <div key={activity.id} className="relative group">
                          <div className={`absolute -left-[15px] top-1.5 size-3 rounded-full bg-${getActivityColor(activity.action)}-400 ring-4 ring-white shadow-md shadow-${getActivityColor(activity.action)}-400/30`} />
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-mono text-slate-400 font-medium">{new Date(activity.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                            <div className="bg-slate-50 p-3 rounded-xl">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-slate-900">
                                  {activity.user?.name ? `${activity.user.name}: ` : ""}
                                  {activity.action.replace(/_/g, " ")}
                                </p>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{activity.details}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {ticketActivities.length === 0 && <p className="text-sm text-center text-slate-400">No activity history.</p>}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
                <p>Select a ticket to view details</p>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              <span className="material-symbols-outlined text-base">bolt</span>
              IT Actions
            </div>
            <div className="bg-white p-6 rounded-lg shadow-soft flex flex-col gap-3">
              <button
                onClick={() => setShowNoteModal(true)}
                disabled={!selectedTicket}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined">edit_note</span>
                Add Technical Note
              </button>
              <button
                onClick={() => setShowFixedModal(true)}
                disabled={!selectedTicket}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">build</span>
                Mark as Fixed
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddNoteModal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} onSubmit={handleAddNote} ticketNumber={selectedTicket?.number} />

      <ConfirmModal
        isOpen={showFixedModal}
        onClose={() => setShowFixedModal(false)}
        onConfirm={handleMarkFixed}
        title="Mark as Fixed"
        message={`This will mark ticket #${selectedTicket?.number} as fixed and return it to Customer Service for closure.`}
        confirmText="Mark Fixed"
        confirmColor="blue"
        isLoading={isLoading}
      />
    </>
  );
}
