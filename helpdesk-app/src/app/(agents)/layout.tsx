'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import ChatWidget from '@/components/chat/ChatWidget';
import type { UserRole } from '@/types';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

const roleTitles: Record<UserRole, string> = {
    senior: 'Senior CS Agent',
    junior: 'Junior CS Agent',
    it: 'IT Support',
    admin: 'Administrator',
};

export default function AgentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get user data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser) as UserData;
                setUser(userData);
            } catch {
                // Invalid data, redirect to login
                router.push('/login');
            }
        } else {
            // No user, redirect to login
            router.push('/login');
        }
        setIsLoading(false);
    }, [router]);

    // Extract role from URL for fallback
    const roleFromUrl = pathname.split('/')[1] as UserRole;

    // While loading, show minimal UI
    if (isLoading) {
        return (
            <div className="bg-[#F3F4F6] overflow-hidden h-screen flex items-center justify-center">
                <span className="size-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
            </div>
        );
    }

    // Use actual user data or fallback
    const displayRole = user?.role || roleFromUrl;
    const displayName = user?.name || 'User';
    const displayTitle = roleTitles[displayRole] || 'Agent';
    const displayAvatar = user?.avatar;

    return (
        <div className="bg-[#F3F4F6] overflow-hidden h-screen flex p-6 gap-6">
            <Sidebar
                role={displayRole}
                userName={displayName}
                userTitle={displayTitle}
                userAvatar={displayAvatar}
            />
            <main className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
                {children}
            </main>
            <ChatWidget currentUserRole={displayRole} />
        </div>
    );
}
