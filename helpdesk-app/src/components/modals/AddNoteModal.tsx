'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';

interface AddNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (note: string) => Promise<void>;
    ticketNumber?: string;
}

export default function AddNoteModal({ isOpen, onClose, onSubmit, ticketNumber }: AddNoteModalProps) {
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!note.trim()) return;

        setIsLoading(true);
        try {
            await onSubmit(note);
            setNote('');
            onClose();
        } catch (error) {
            console.error('Failed to add note:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setNote('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={ticketNumber ? `Add Note to #${ticketNumber}` : 'Add Note'}
            size="md"
        >
            <div className="space-y-5">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <span className="material-symbols-outlined text-slate-400 text-sm">edit_note</span>
                        Note
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Write your note here..."
                        rows={5}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none resize-none"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !note.trim()}
                        className="flex-1 px-4 py-3 bg-[#EB4C36] text-white rounded-xl font-bold shadow-lg shadow-[#EB4C36]/30 hover:bg-[#d13a25] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            'Add Note'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
