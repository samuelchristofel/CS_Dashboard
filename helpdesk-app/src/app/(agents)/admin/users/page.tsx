'use client';

import { useState } from 'react';

const mockUsers = [
    { id: '1', name: 'Jay Won', email: 'jay@helpdesk.com', role: 'Senior CS', status: 'Active', tickets: 423 },
    { id: '2', name: 'Himari', email: 'himari@helpdesk.com', role: 'Junior CS', status: 'Active', tickets: 312 },
    { id: '3', name: 'Andi R.', email: 'andi@helpdesk.com', role: 'Junior CS', status: 'Active', tickets: 245 },
    { id: '4', name: 'Budi Santoso', email: 'budi@helpdesk.com', role: 'IT Support', status: 'Active', tickets: 89 },
    { id: '5', name: 'Admin', email: 'admin@helpdesk.com', role: 'Super Admin', status: 'Active', tickets: 0 },
];

export default function AdminUsersPage() {
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage system users and permissions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-2.5 bg-white rounded-full shadow-soft text-sm w-64 focus:ring-2 focus:ring-slate-800/20 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-full font-bold text-sm shadow-lg"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Add User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="flex-1 bg-white rounded-[2rem] shadow-soft overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-400 uppercase">
                    <div className="w-12"></div>
                    <div className="flex-1">Name</div>
                    <div className="w-48">Email</div>
                    <div className="w-28">Role</div>
                    <div className="w-20">Status</div>
                    <div className="w-24">Tickets</div>
                    <div className="w-24 text-right">Actions</div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {mockUsers.map((user) => (
                        <div key={user.id} className="px-6 py-4 border-b border-slate-50 flex items-center gap-4 hover:bg-slate-50">
                            <div className="w-12">
                                <div className={`size-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.role === 'Senior CS' ? 'bg-[#EB4C36]' :
                                        user.role === 'Junior CS' ? 'bg-emerald-500' :
                                            user.role === 'IT Support' ? 'bg-blue-500' : 'bg-slate-800'
                                    }`}>
                                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                            </div>
                            <div className="w-48 text-sm text-slate-500">{user.email}</div>
                            <div className="w-28">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.role === 'Senior CS' ? 'bg-red-50 text-red-500' :
                                        user.role === 'Junior CS' ? 'bg-green-50 text-green-600' :
                                            user.role === 'IT Support' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className="w-20">
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600">
                                    {user.status}
                                </span>
                            </div>
                            <div className="w-24 text-sm text-slate-900 font-semibold">{user.tickets}</div>
                            <div className="w-24 flex justify-end gap-1">
                                <button className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                                    <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button className="size-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100">
                                    <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Add New User</h2>
                        <p className="text-slate-500">User creation will be implemented with database integration.</p>
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="mt-6 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
