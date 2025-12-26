'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import CustomSelect from '../ui/CustomSelect';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'senior' | 'junior' | 'it' | 'admin';
    avatar?: string;
}

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EditUserFormData) => Promise<void>;
    user: User | null;
}

export interface EditUserFormData {
    name: string;
    email: string;
    password?: string;
    role: 'senior' | 'junior' | 'it' | 'admin';
    avatar?: string;
}

export default function EditUserModal({ isOpen, onClose, onSubmit, user }: EditUserModalProps) {
    const [formData, setFormData] = useState<EditUserFormData>({
        name: '',
        email: '',
        password: '',
        role: 'junior',
        avatar: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof EditUserFormData, string>>>({});

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                avatar: user.avatar || '',
            });
        }
    }, [user]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof EditUserFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Failed to update user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Edit User" size="md">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                        <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-800/20 focus:outline-none ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                        <span className="material-symbols-outlined text-slate-400 text-sm">mail</span>
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-800/20 focus:outline-none ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                        <span className="material-symbols-outlined text-slate-400 text-sm">lock</span>
                        New Password <span className="text-slate-400">(leave blank to keep current)</span>
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter new password"
                        className={`w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-800/20 focus:outline-none ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                {/* Role */}
                <CustomSelect
                    label="Role"
                    icon="badge"
                    value={formData.role}
                    onChange={(value) => setFormData({ ...formData, role: value as EditUserFormData['role'] })}
                    options={[
                        { value: 'senior', label: 'Senior CS' },
                        { value: 'junior', label: 'Junior CS' },
                        { value: 'it', label: 'IT Support' },
                        { value: 'admin', label: 'Admin' },
                    ]}
                />

                {/* Avatar URL */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                        <span className="material-symbols-outlined text-slate-400 text-sm">image</span>
                        Avatar URL <span className="text-slate-400">(optional)</span>
                    </label>
                    <input
                        type="url"
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-800/20 focus:outline-none"
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
