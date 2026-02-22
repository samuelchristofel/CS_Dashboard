'use client';

import { useEffect, useMemo, useState } from 'react';
import TicketDetailModal from '@/components/modals/TicketDetailModal';
import { toast } from 'react-hot-toast';
import { useUnreadNotifications } from '@/components/providers/UnreadNotificationProvider';

type NotificationFilter = 'all' | 'actions' | 'new_ticket' | 'notes';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  description: string;
  ticket_id?: string | null;
  is_read: boolean;
  created_at: string;
  ticket?: {
    id: string;
    number: string;
    subject: string;
    source?: string;
    customer_name?: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    status?: string;
  } | null;
}

const filterOptions: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'actions', label: 'Aksi' },
  { value: 'new_ticket', label: 'Tiket Baru' },
  { value: 'notes', label: 'Catatan' },
];

const typeConfig: Record<string, { icon: string; circle: string }> = {
  new_ticket: { icon: 'confirmation_number', circle: 'bg-orange-100 text-orange-600' },
  assigned: { icon: 'person', circle: 'bg-purple-100 text-purple-600' },
  escalated: { icon: 'north', circle: 'bg-blue-100 text-blue-600' },
  resolved: { icon: 'task_alt', circle: 'bg-green-100 text-green-600' },
  note_added: { icon: 'chat', circle: 'bg-slate-200 text-slate-600' },
  overdue: { icon: 'warning', circle: 'bg-red-100 text-red-600' },
  fixed: { icon: 'build', circle: 'bg-blue-100 text-blue-600' },
};

function formatTimeLabel(value: string) {
  const target = new Date(value).getTime();
  const now = Date.now();
  const diffMs = now - target;
  if (diffMs < 60_000) return 'Baru saja';
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} menit yang lalu`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)} jam yang lalu`;
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function shouldIncludeByFilter(type: string, filter: NotificationFilter) {
  if (filter === 'all') return true;
  if (filter === 'new_ticket') return type === 'new_ticket';
  if (filter === 'notes') return type === 'note_added';
  if (filter === 'actions') return type !== 'new_ticket';
  return true;
}

export default function NotificationCenter() {
  const [userId, setUserId] = useState<string>('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const { unreadCount, setUnreadCount, decrementUnread, refreshUnreadCount } = useUnreadNotifications();

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;
    const user = JSON.parse(userRaw) as { id?: string };
    if (user.id) setUserId(user.id);
  }, []);

  const fetchNotifications = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications?user_id=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Notification fetch error:', error);
      toast.error('Gagal memuat notifikasi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const markOneRead = async (notificationId: string) => {
    const item = notifications.find((n) => n.id === notificationId);
    if (!item || item.is_read) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
    );
    decrementUnread();

    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error('Failed to mark read');
    } catch (error) {
      console.error('Mark as read error:', error);
      toast.error('Gagal menandai dibaca');
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: false } : n)),
      );
    } finally {
      refreshUnreadCount();
    }
  };

  const markAllRead = async () => {
    if (!userId || unreadCount === 0) return;

    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error('Failed to mark all read');
    } catch (error) {
      console.error('Mark all read error:', error);
      toast.error('Gagal menandai semua dibaca');
      setNotifications(previous);
    } finally {
      refreshUnreadCount();
    }
  };

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const toTs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;
    const fromTs = dateFrom ? new Date(`${dateFrom}T00:00:00.000`).getTime() : null;

    const filtered = notifications.filter((item) => {
      if (!shouldIncludeByFilter(item.type, filter)) return false;

      const createdTs = new Date(item.created_at).getTime();
      if (fromTs && createdTs < fromTs) return false;
      if (toTs && createdTs > toTs) return false;

      if (!normalizedQuery) return true;

      const haystack = [
        item.title,
        item.description,
        item.ticket?.customer_name || '',
        item.ticket?.subject || '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    filtered.sort((a, b) => {
      const aTs = new Date(a.created_at).getTime();
      const bTs = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? bTs - aTs : aTs - bTs;
    });

    return filtered;
  }, [notifications, filter, searchQuery, dateFrom, dateTo, sortOrder]);

  const hasActiveSearchOrDate = !!searchQuery.trim() || !!dateFrom || !!dateTo;

  return (
    <>
      <div className="space-y-4 text-[13px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifikasi</h1>
            <p className="text-sm text-slate-500 mt-1">Riwayat aktivitas dan notifikasi sistem</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-[14px] py-[6px] rounded-[6px] border border-[#d1d5db] bg-white text-[#374151] text-[13px] font-medium hover:bg-slate-50"
              >
                Mark All as Read
              </button>
            )}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as NotificationFilter)}
              className="px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EB4C36]/20"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari notifikasi..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-slate-200 shadow-soft text-sm focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2">
            <span className="text-xs text-slate-500">Dari</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="Dari"
              className="text-sm text-slate-700 focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2">
            <span className="text-xs text-slate-500">Sampai</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="Sampai"
              className="text-sm text-slate-700 focus:outline-none bg-transparent"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="size-9 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center"
              aria-label="Reset date range"
              title="Reset"
            >
              ×
            </button>
          )}
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
            className="px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
          >
            {sortOrder === 'newest' ? 'Terbaru' : 'Terlama'}
            <span>{sortOrder === 'newest' ? '↓' : '↑'}</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          {isLoading ? (
            <div className="py-16 flex items-center justify-center">
              <span className="size-8 border-2 border-slate-200 border-t-[#EB4C36] rounded-full animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-2">notifications_off</span>
              <p className="text-sm">
                {hasActiveSearchOrDate ? 'Tidak ada notifikasi yang cocok' : 'Tidak ada notifikasi'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((item) => {
                const config = typeConfig[item.type] || {
                  icon: 'notifications',
                  circle: 'bg-slate-200 text-slate-600',
                };
                return (
                  <div
                    key={item.id}
                    className={`px-4 py-3 transition-colors ${item.is_read ? 'bg-white hover:bg-slate-50' : 'bg-[#f0f7ff] hover:bg-[#eaf4ff]'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`size-9 rounded-full flex items-center justify-center ${config.circle}`}>
                        <span className="material-symbols-outlined text-base">{config.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-900">{item.title}</p>
                        <p className="text-[12px] text-slate-500 mt-0.5">{item.description}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{formatTimeLabel(item.created_at)}</p>
                      </div>

                      <div className="flex items-center gap-3 pl-2">
                        <button
                          type="button"
                          disabled={item.is_read}
                          onClick={() => markOneRead(item.id)}
                          className={`text-[12px] px-3 py-1.5 rounded-md border ${
                            item.is_read
                              ? 'border-[#e5e7eb] bg-[#f9fafb] text-[#9ca3af] cursor-default'
                              : 'border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f3f4f6]'
                          }`}
                        >
                          {item.is_read ? '✓ Read' : 'Mark as Read'}
                        </button>
                        {item.ticket_id && (
                          <button
                            onClick={() => setSelectedTicketId(item.ticket_id || null)}
                            className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-200"
                            title="Lihat tiket"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <TicketDetailModal
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        ticketId={selectedTicketId}
      />
    </>
  );
}
