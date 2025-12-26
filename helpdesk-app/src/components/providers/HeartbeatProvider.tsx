'use client';

import { useEffect } from 'react';

const HEARTBEAT_INTERVAL = 60 * 1000; // 1 minute

export default function HeartbeatProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const sendHeartbeat = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;

                const user = JSON.parse(userStr);
                if (!user.id) return;

                await fetch('/api/auth/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: user.id }),
                });
            } catch (error) {
                console.error('Failed to send heartbeat:', error);
            }
        };

        // Send immediately on mount
        sendHeartbeat();

        // Setup interval
        const intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

        return () => clearInterval(intervalId);
    }, []);

    return <>{children}</>;
}
