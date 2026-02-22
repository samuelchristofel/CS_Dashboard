'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface UnreadNotificationContextValue {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => Promise<void>;
  decrementUnread: () => void;
}

const UnreadNotificationContext = createContext<UnreadNotificationContextValue | null>(null);

export function UnreadNotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCountState] = useState(0);

  const setUnreadCount = useCallback((count: number) => {
    setUnreadCountState(Math.max(0, count));
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;
    const user = JSON.parse(userRaw) as { id?: string };
    if (!user?.id) return;

    try {
      const res = await fetch(`/api/notifications/unread-count?user_id=${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCountState(Math.max(0, Number(data.count || 0)));
    } catch {
      // keep UI resilient
    }
  }, []);

  const decrementUnread = useCallback(() => {
    setUnreadCountState((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const value = useMemo(
    () => ({
      unreadCount,
      setUnreadCount,
      refreshUnreadCount,
      decrementUnread,
    }),
    [unreadCount, setUnreadCount, refreshUnreadCount, decrementUnread],
  );

  return <UnreadNotificationContext.Provider value={value}>{children}</UnreadNotificationContext.Provider>;
}

export function useUnreadNotifications() {
  const context = useContext(UnreadNotificationContext);
  if (!context) {
    throw new Error('useUnreadNotifications must be used within UnreadNotificationProvider');
  }
  return context;
}
