'use client';

import { useState } from 'react';
import CustomSelect from '@/components/ui/CustomSelect';

interface TicketFiltersProps {
    onSearch?: (query: string) => void;
    onStatusChange?: (status: string) => void;
    onPriorityChange?: (priority: string) => void;
    showCreateButton?: boolean;
    onCreateClick?: () => void;
    showStatusFilter?: boolean;
    showPriorityFilter?: boolean;
}

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'WITH_IT', label: 'With IT' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
];

const priorityOptions = [
    { value: '', label: 'All Priority' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
];

export default function TicketFilters({
    onSearch,
    onStatusChange,
    onPriorityChange,
    showCreateButton = false,
    onCreateClick,
    showStatusFilter = true,
    showPriorityFilter = true,
}: TicketFiltersProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        onSearch?.(e.target.value);
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        onStatusChange?.(value);
    };

    const handlePriorityChange = (value: string) => {
        setPriority(value);
        onPriorityChange?.(value);
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
            {showStatusFilter && (
                <CustomSelect
                    options={statusOptions}
                    value={status}
                    onChange={handleStatusChange}
                    placeholder="All Status"
                    variant="filter"
                />
            )}

            {/* Priority Filter */}
            {showPriorityFilter && (
                <CustomSelect
                    options={priorityOptions}
                    value={priority}
                    onChange={handlePriorityChange}
                    placeholder="All Priority"
                    variant="filter"
                />
            )}

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
