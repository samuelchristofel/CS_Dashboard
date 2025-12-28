import type { UserRole } from '@/types';

interface ScoreCardProps {
    role: UserRole;
    userName: string;
    score: number;
    maxScore?: number;
    message: string;
    period?: string;
}

const gradients: Record<UserRole, string> = {
    senior: 'from-[#EB4C36] to-[#d13a25]',
    junior: 'from-emerald-500 to-green-700',
    it: 'from-blue-500 to-blue-700',
    admin: 'from-slate-800 to-slate-900',
};

// Generate current month/year dynamically
const currentPeriod = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default function ScoreCard({
    role,
    userName,
    score,
    maxScore = 100,
    message,
    period = currentPeriod
}: ScoreCardProps) {
    const gradient = gradients[role];
    const isAdminOrIT = role === 'admin' || role === 'it';

    return (
        <div className={`bg-gradient-to-br ${gradient} rounded-[2rem] shadow-soft p-6 text-white`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm font-semibold opacity-90">
                        {role === 'admin' ? 'System Overview' : `Halo ${userName},`}
                    </p>
                    <p className="text-xs opacity-70">
                        {isAdminOrIT ? 'Total Resolved:' : 'Sisa Poin Bulan Ini:'}
                    </p>
                </div>
                <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full">
                    {period}
                </span>
            </div>
            <div className="flex items-end gap-3">
                <span className="text-5xl font-extrabold">{score}</span>
                <span className="text-2xl font-bold opacity-70 mb-1">
                    {isAdminOrIT ? 'tickets' : `/${maxScore}`}
                </span>
            </div>
            <p className="text-sm opacity-80 mt-2">{message}</p>
        </div>
    );
}
