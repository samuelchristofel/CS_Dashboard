'use client';

import { useState } from 'react';

interface TicketFiltersProps {
    onSearch?: (query: string) => void;
    onStatusChange?: (status: string) => void;
    onPriorityChange?: (priority: string) => void;
    showCreateButton?: boolean;
    onCreateClick?: () => void;
}

export default function TicketFilters({
    onSearch,
    onStatusChange,
    onPriorityChange,
    showCreateButton = false,
    onCreateClick,
}: TicketFiltersProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        onSearch?.(e.target.value);
    };

    return (
        <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    search
                </span>
                <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 pr-4 py-2.5 bg-white rounded-full border-none shadow-soft text-sm w-64 focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none"
                />
            </div>

            {/* Status Filter */}
            <div className="relative">
                <select
                    onChange={(e) => onStatusChange?.(e.target.value)}
                    className="appearance-none px-4 py-2.5 pr-10 bg-white rounded-full border-none shadow-soft text-sm font-medium cursor-pointer focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none"
                >
                    <option value="">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PENDING_REVIEW">Pending Review</option>
                    <option value="WITH_IT">With IT</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                    expand_more
                </span>
            </div>

            {/* Priority Filter */}
            <div className="relative">
                <select
                    onChange={(e) => onPriorityChange?.(e.target.value)}
                    className="appearance-none px-4 py-2.5 pr-10 bg-white rounded-full border-none shadow-soft text-sm font-medium cursor-pointer focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none"
                >
                    <option value="">All Priority</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                    expand_more
                </span>
            </div>

            {/* Create Button */}
            {showCreateButton && (
                <button
                    onClick={onCreateClick}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#EB4C36] text-white rounded-full font-bold text-sm shadow-lg shadow-[#EB4C36]/30 hover:bg-[#d13a25] transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    New Ticket
                </button>
            )}
        </div>
    );
}
