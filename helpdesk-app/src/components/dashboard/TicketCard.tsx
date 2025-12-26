import type { Priority, TicketStatus } from '@/types';

interface TicketCardProps {
    ticketNumber: string;
    subject: string;
    description?: string;
    priority: Priority;
    status: TicketStatus;
    customerName: string;
    customerInitials: string;
    timeAgo: string;
    assignedBy?: string;
    onClick?: () => void;
    selected?: boolean;
    accentColor?: string;
}

const priorityColors: Record<Priority, string> = {
    HIGH: 'bg-red-50 text-red-500',
    MEDIUM: 'bg-amber-100 text-amber-600',
    LOW: 'bg-blue-100 text-blue-600',
};

const statusColors: Record<TicketStatus, string> = {
    OPEN: 'bg-slate-100 text-slate-500',
    TRIAGE: 'bg-purple-100 text-purple-600',
    IN_PROGRESS: 'bg-blue-50 text-blue-600',
    RESOLVED: 'bg-green-100 text-green-600',
    CLOSED: 'bg-green-100 text-green-700',
    PENDING_REVIEW: 'bg-amber-100 text-amber-700',
    WITH_IT: 'bg-blue-100 text-blue-700',
};

export default function TicketCard({
    ticketNumber,
    subject,
    description,
    priority,
    status,
    customerName,
    customerInitials,
    timeAgo,
    assignedBy,
    onClick,
    selected = false,
    accentColor = '#EB4C36',
}: TicketCardProps) {
    return (
        <div
            className={`p-5 rounded-3xl bg-white border border-slate-100 cursor-pointer transition-all hover:shadow-lg
                ${selected ? 'ring-2' : ''}`}
            style={selected ? { '--tw-ring-color': accentColor } as React.CSSProperties : undefined}
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">#{ticketNumber}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${priorityColors[priority]}`}>
                        {priority}
                    </span>
                </div>
                <span className="text-xs font-medium text-slate-400">{timeAgo}</span>
            </div>

            <h3 className="text-base font-semibold text-slate-900 mb-1">{subject}</h3>

            {description && (
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{description}</p>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-700 font-bold">
                        {customerInitials}
                    </div>
                    <span className="text-sm font-medium text-slate-500">{customerName}</span>
                </div>

                {assignedBy && (
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                        Assigned by {assignedBy}
                    </span>
                )}

                {status && !assignedBy && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[status]}`}>
                        {status.replace('_', ' ')}
                    </span>
                )}
            </div>
        </div>
    );
}
