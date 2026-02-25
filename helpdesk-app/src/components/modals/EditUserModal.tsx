'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
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
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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
            // Set preview if avatar exists
            if (user.avatar) {
                setAvatarPreview(user.avatar);
            } else {
                setAvatarPreview(null);
            }
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

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setAvatarPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        setIsUploadingAvatar(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            if (res.ok) {
                const data = await res.json();
                setFormData({ ...formData, avatar: data.avatar });
                toast.success('Avatar uploaded!');
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to upload avatar');
                setAvatarPreview(user?.avatar || null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Network error');
            setAvatarPreview(user?.avatar || null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleRemoveAvatar = () => {
        setFormData({ ...formData, avatar: '' });
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
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
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
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

                {/* Avatar Upload */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                        <span className="material-symbols-outlined text-slate-400 text-sm">image</span>
                        Avatar <span className="text-slate-400">(optional)</span>
                    </label>
                    
                    {/* Avatar Preview */}
                    {avatarPreview && (
                        <div className="mb-3 relative w-24 h-24">
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="w-24 h-24 rounded-lg object-cover border-2 border-slate-200"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                disabled={isUploadingAvatar}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleAvatarChange}
                        disabled={isUploadingAvatar}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-slate-800/20 focus:outline-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        {isUploadingAvatar ? '⏳ Uploading...' : '📁 Supported: JPEG, PNG, WebP, GIF (Max 5MB)'}
                    </p>
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
