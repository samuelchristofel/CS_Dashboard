'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import TicketDetailModal from '@/components/modals/TicketDetailModal';

type UserRole = 'admin' | 'senior' | 'junior' | 'it';

interface SessionUser {
  id: string;
  role: UserRole;
  name: string;
}

interface TicketItem {
  id: string;
  number: string;
  subject: string;
  customer_name: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  created_at: string;
}

interface TicketToast {
  id: string;
  ticketId: string;
  ticketNumber: string;
  subject: string;
  customerName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  isLeaving: boolean;
}

const VISIBLE_LIMIT = 3;
const AUTO_DISMISS_MS = 60000;
const LEAVE_ANIMATION_MS = 260;
const POLL_INTERVAL_MS = 12000;

const priorityColor: Record<TicketToast['priority'], string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f97316',
  LOW: '#16a34a',
};

const priorityBadgeClass: Record<TicketToast['priority'], string> = {
  HIGH: 'bg-red-50 text-red-600 border-red-200',
  MEDIUM: 'bg-orange-50 text-orange-600 border-orange-200',
  LOW: 'bg-green-50 text-green-600 border-green-200',
};

function nowIso() {
  return new Date().toISOString();
}

function sourceClass(source: string) {
  if (source === 'Freshchat') return 'bg-purple-50 text-purple-600';
  if (source === 'WhatsApp') return 'bg-green-50 text-green-600';
  if (source === 'Email') return 'bg-blue-50 text-blue-600';
  if (source === 'Phone') return 'bg-slate-100 text-slate-600';
  return 'bg-slate-100 text-slate-600';
}

function readSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export default function ToastProvider() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [visibleToasts, setVisibleToasts] = useState<TicketToast[]>([]);
  const [queue, setQueue] = useState<TicketToast[]>([]);
  const [viewingTicketId, setViewingTicketId] = useState<string | null>(null);

  const seenIdsRef = useRef<Set<string>>(new Set());
  const dismissTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const removeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const loginSinceIso = useMemo(() => {
    if (!sessionUser?.id || typeof window === 'undefined') return null;
    const key = `ticket_toast_login_since_${sessionUser.id}`;
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const created = nowIso();
    sessionStorage.setItem(key, created);
    return created;
  }, [sessionUser?.id]);

  const seenStorageKey = useMemo(() => {
    if (!sessionUser?.id) return null;
    return `ticket_toast_seen_${sessionUser.id}`;
  }, [sessionUser?.id]);

  useEffect(() => {
    const user = readSessionUser();
    setSessionUser(user);
  }, []);

  useEffect(() => {
    if (!seenStorageKey || typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(seenStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as string[];
      seenIdsRef.current = new Set(parsed);
    } catch {
      seenIdsRef.current = new Set();
    }
  }, [seenStorageKey]);

  const persistSeenIds = useCallback(() => {
    if (!seenStorageKey || typeof window === 'undefined') return;
    sessionStorage.setItem(seenStorageKey, JSON.stringify([...seenIdsRef.current]));
  }, [seenStorageKey]);

  const clearTimer = useCallback((id: string) => {
    const dismissTimer = dismissTimersRef.current.get(id);
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimersRef.current.delete(id);
    }
    const removeTimer = removeTimersRef.current.get(id);
    if (removeTimer) {
      clearTimeout(removeTimer);
      removeTimersRef.current.delete(id);
    }
  }, []);

  const isTicketOpenInAnyDrawer = useCallback((ticketNumber: string, ticketId: string) => {
    if (viewingTicketId === ticketId) return true;
    if (typeof document === 'undefined') return false;
    const closeButtons = Array.from(document.querySelectorAll('button[aria-label="Close ticket detail"]'));
    return closeButtons.some((btn) => {
      const host = btn.closest('div.fixed.inset-0');
      if (!host) return false;
      const text = host.textContent || '';
      return text.includes(`#${ticketNumber}`);
    });
  }, [viewingTicketId]);

  const dismissToast = useCallback((toastId: string) => {
    clearTimer(toastId);
    setVisibleToasts((prev) => prev.map((item) => (item.id === toastId ? { ...item, isLeaving: true } : item)));
    const removeTimer = setTimeout(() => {
      setVisibleToasts((prev) => prev.filter((item) => item.id !== toastId));
      removeTimersRef.current.delete(toastId);
    }, LEAVE_ANIMATION_MS);
    removeTimersRef.current.set(toastId, removeTimer);
  }, [clearTimer]);

  const showToast = useCallback((toast: TicketToast) => {
    setVisibleToasts((prev) => {
      if (prev.length >= VISIBLE_LIMIT) return prev;
      return [...prev, toast];
    });

    const dismissTimer = setTimeout(() => dismissToast(toast.id), AUTO_DISMISS_MS);
    dismissTimersRef.current.set(toast.id, dismissTimer);
  }, [dismissToast]);

  useEffect(() => {
    if (visibleToasts.length >= VISIBLE_LIMIT || queue.length === 0) return;
    const next = queue[0];
    setQueue((prev) => prev.slice(1));
    showToast(next);
  }, [queue, showToast, visibleToasts.length]);

  const enqueueToast = useCallback((toast: TicketToast) => {
    setVisibleToasts((prev) => {
      const existsVisible = prev.some((item) => item.ticketId === toast.ticketId);
      if (existsVisible) return prev;
      if (prev.length < VISIBLE_LIMIT) {
        const dismissTimer = setTimeout(() => dismissToast(toast.id), AUTO_DISMISS_MS);
        dismissTimersRef.current.set(toast.id, dismissTimer);
        return [...prev, toast];
      }
      setQueue((existingQueue) => {
        const existsQueued = existingQueue.some((item) => item.ticketId === toast.ticketId);
        if (existsQueued) return existingQueue;
        return [...existingQueue, toast];
      });
      return prev;
    });
  }, [dismissToast]);

  const pollNewTickets = useCallback(async () => {
    if (!sessionUser?.id || !loginSinceIso) return;
    try {
      const res = await fetch('/api/tickets?limit=100');
      if (!res.ok) return;
      const data = await res.json();
      const tickets = (data.tickets || []) as TicketItem[];
      for (const ticket of tickets) {
        if (!ticket?.id || seenIdsRef.current.has(ticket.id)) continue;
        const created = new Date(ticket.created_at).getTime();
        const since = new Date(loginSinceIso).getTime();
        seenIdsRef.current.add(ticket.id);

        if (!Number.isFinite(created) || created < since) {
          continue;
        }

        if (isTicketOpenInAnyDrawer(ticket.number, ticket.id)) {
          continue;
        }

        const toastItem: TicketToast = {
          id: `${ticket.id}-${created}`,
          ticketId: ticket.id,
          ticketNumber: ticket.number,
          subject: ticket.subject,
          customerName: ticket.customer_name,
          priority: ticket.priority,
          source: ticket.source,
          isLeaving: false,
        };
        enqueueToast(toastItem);
      }
      persistSeenIds();
    } catch {
      // silent: this runs globally and should not interrupt the app
    }
  }, [enqueueToast, isTicketOpenInAnyDrawer, loginSinceIso, persistSeenIds, sessionUser?.id]);

  useEffect(() => {
    if (!sessionUser?.id || !loginSinceIso) return;
    pollNewTickets();
    const interval = setInterval(pollNewTickets, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loginSinceIso, pollNewTickets, sessionUser?.id]);

  useEffect(() => {
    return () => {
      dismissTimersRef.current.forEach((timer) => clearTimeout(timer));
      removeTimersRef.current.forEach((timer) => clearTimeout(timer));
      dismissTimersRef.current.clear();
      removeTimersRef.current.clear();
    };
  }, []);

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
          },
        }}
      />

      <div className="fixed bottom-6 right-6 z-[90] flex w-[320px] flex-col-reverse gap-2 pointer-events-none">
        {visibleToasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-enter pointer-events-auto overflow-hidden rounded-lg bg-white shadow-[0_8px_24px_rgba(15,23,42,0.14)] transition-all duration-300 ${
              toast.isLeaving ? 'translate-x-8 opacity-0' : 'translate-x-0 opacity-100'
            }`}
            style={{ borderLeft: `4px solid ${priorityColor[toast.priority]}` }}
          >
            <div className="px-3 py-2.5">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <p className="text-[13px] font-bold text-slate-900">🎫 Tiket Baru Masuk</p>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
                  aria-label="Dismiss notification"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <p className="text-[12px] text-slate-700 leading-5 break-words">
                #{toast.ticketNumber} {toast.subject}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px] text-slate-600">
                <span>{toast.customerName}</span>
                <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${priorityBadgeClass[toast.priority]}`}>{toast.priority}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${sourceClass(toast.source)}`}>{toast.source}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewingTicketId(toast.ticketId);
                  dismissToast(toast.id);
                }}
                className="mt-2 text-[12px] font-semibold text-[#EB4C36] hover:text-[#d13a25]"
              >
                Lihat Tiket →
              </button>
            </div>

            <div className="h-[3px] w-full bg-slate-100">
              <div
                className="toast-drain h-full"
                style={{
                  backgroundColor: priorityColor[toast.priority],
                  animationDuration: `${AUTO_DISMISS_MS}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <TicketDetailModal isOpen={!!viewingTicketId} onClose={() => setViewingTicketId(null)} ticketId={viewingTicketId} />

      <style jsx global>{`
        @keyframes toastDrain {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .toast-drain {
          animation-name: toastDrain;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes toastEnter {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .toast-enter {
          animation: toastEnter 220ms ease-out;
        }
      `}</style>
    </>
  );
}
