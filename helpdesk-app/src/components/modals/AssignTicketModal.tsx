'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';

interface Agent {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

interface AssignTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (agentId: string) => Promise<void>;
    ticketNumber: string;
    currentAssignee?: string;
    agents: Agent[];
}

export default function AssignTicketModal({
    isOpen,
    onClose,
    onSubmit,
    ticketNumber,
    currentAssignee,
    agents,
}: AssignTicketModalProps) {
    const [selectedAgent, setSelectedAgent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!selectedAgent) return;

        setIsLoading(true);
        try {
            await onSubmit(selectedAgent);
            setSelectedAgent('');
            onClose();
        } catch (error) {
            console.error('Failed to assign ticket:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedAgent('');
        onClose();
    };

    const roleColors: Record<string, string> = {
        'Senior CS': 'bg-[#EB4C36]',
        'Junior CS': 'bg-emerald-500',
        'IT Support': 'bg-blue-500',
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Assign Ticket #${ticketNumber}`} size="md">
            <div className="space-y-5">
                {/* Current Assignment */}
                {currentAssignee && (
                    <div className="bg-slate-50 rounded-xl p-4">
                        <p className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
                            <span className="material-symbols-outlined text-base">person</span>
                            Currently Assigned To
                        </p>
                        <p className="text-sm font-bold text-slate-900">{currentAssignee}</p>
                    </div>
                )}

                {/* Agent Selection */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                        <span className="material-symbols-outlined text-slate-400 text-sm">group</span>
                        Select Agent
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {agents.map((agent) => (
                            <div
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedAgent === agent.id
                                        ? 'bg-[#EB4C36]/10 ring-2 ring-[#EB4C36]'
                                        : 'bg-slate-50 hover:bg-slate-100'
                                    }`}
                            >
                                {agent.avatar ? (
                                    <div
                                        className="size-10 rounded-full bg-cover bg-center"
                                        style={{ backgroundImage: `url('${agent.avatar}')` }}
                                    />
                                ) : (
                                    <div className={`size-10 rounded-full ${roleColors[agent.role] || 'bg-slate-400'} flex items-center justify-center text-white font-bold text-sm`}>
                                        {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                                    <p className="text-xs text-slate-500">{agent.role}</p>
                                </div>
                                {selectedAgent === agent.id && (
                                    <span className="material-symbols-outlined text-[#EB4C36]">check_circle</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !selectedAgent}
                        className="flex-1 px-4 py-3 bg-[#EB4C36] text-white rounded-xl font-bold shadow-lg shadow-[#EB4C36]/30 hover:bg-[#d13a25] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Assigning...
                            </span>
                        ) : (
                            'Assign'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
