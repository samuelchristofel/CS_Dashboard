'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import ChatWidget from '@/components/chat/ChatWidget';
import type { UserRole } from '@/types';

const roleConfig: Record<string, { role: UserRole; name: string; title: string; avatar?: string }> = {
    senior: {
        role: 'senior',
        name: 'Jay Won',
        title: 'Senior CS Agent',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoS1f1jqiPLCv9wP1ZX5ODYa0ghkKGjzT0pHb0bhhH20OWJucjJF3IaQ3_s7kGdgzSrESvLELeRePVCXvRr6Yy6B44ot4XYOMJ8EMZqG-XCW3_LdyPn99i7jvXqfWcPrKLwpHBNINwHk8ii2yZhCVjb4ie45MSAzkKY1ThrKQqU6IW1IYNMpiJCMbLekMBKotxWueVnTbLJwOjHjthhnsBYumDmvRUF1jRAc8enpPdmTnLWmqaUL-YtKY7AbgW3bg6V9BjT3ZcykA',
    },
    junior: {
        role: 'junior',
        name: 'Himari',
        title: 'Junior CS Agent',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN0rsqgI4Fv1zrp1NtwFDfMAtVMQ2Oy1GVDJOvJ6nCUCQ7jsiVV56xA7nbgCm5tdWoz7uRJrvKLjNMVQjnTMrOkljsYHrZQXhnMHQ5CdvP5axphgV6bpBS37A56yKKtC62X_dV8ExJ__FV1vSZxJHnm6MtQpfaAfapPm0coFGD-DUok5mewrK8Mmy6ABuxS5_YsFmQs1t22lop8_n8TY7Vk9QXC4c9Gu2AMIHn2KB-a37kNDLDGLObRehy6a9NVQSgv140p_nRAM8',
    },
    it: {
        role: 'it',
        name: 'Budi Santoso',
        title: 'IT Support Staff',
    },
    admin: {
        role: 'admin',
        name: 'Admin',
        title: 'Super Administrator',
    },
};

export default function AgentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Extract role from URL: /senior/... → senior, /admin/... → admin
    const roleFromUrl = pathname.split('/')[1] as keyof typeof roleConfig;
    const config = roleConfig[roleFromUrl] || roleConfig.senior;

    return (
        <div className="bg-[#F3F4F6] overflow-hidden h-screen flex p-6 gap-6">
            <Sidebar
                role={config.role}
                userName={config.name}
                userTitle={config.title}
                userAvatar={config.avatar}
            />
            <main className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
                {children}
            </main>
            <ChatWidget currentUserRole={config.role} />
        </div>
    );
}
