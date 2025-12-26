'use client';

import Modal from './Modal';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: 'red' | 'green' | 'blue' | 'amber';
    isLoading?: boolean;
}

const colorClasses = {
    red: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
    green: 'bg-green-500 hover:bg-green-600 shadow-green-500/30',
    blue: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30',
    amber: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
};

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    confirmColor = 'red',
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-6">
                <p className="text-slate-600">{message}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-3 text-white rounded-xl font-bold shadow-lg transition-colors disabled:opacity-50 ${colorClasses[confirmColor]}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
