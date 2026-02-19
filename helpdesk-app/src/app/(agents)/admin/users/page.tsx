"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import AddUserModal from "@/components/modals/AddUserModal";
import EditUserModal from "@/components/modals/EditUserModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { UserFormData } from "@/components/modals/AddUserModal";
import type { EditUserFormData } from "@/components/modals/EditUserModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: "senior" | "junior" | "it" | "admin";
  avatar?: string;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  senior: "Senior CS",
  junior: "Junior CS",
  it: "IT Support",
  admin: "Super Admin",
};

const roleColors: Record<string, string> = {
  senior: "bg-[#EB4C36]",
  junior: "bg-emerald-500",
  it: "bg-blue-500",
  admin: "bg-slate-800",
};

const roleBadgeColors: Record<string, string> = {
  senior: "bg-red-50 text-red-500",
  junior: "bg-green-50 text-green-600",
  it: "bg-blue-50 text-blue-600",
  admin: "bg-slate-100 text-slate-600",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (data: UserFormData) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("User created successfully!");
      } else {
        toast.error("Failed to create user");
      }
      fetchUsers();
    } catch {
      toast.error("Network error");
    }
  };

  const handleEditUser = async (data: EditUserFormData) => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("User updated successfully!");
      } else {
        toast.error("Failed to update user");
      }
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch {
      toast.error("Network error");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("User deleted successfully!");
      } else {
        toast.error("Failed to delete user");
      }
    } catch {
      toast.error("Network error");
    }

    setIsDeleting(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
    fetchUsers();
  };

  // Filter users by search
  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white rounded-full shadow-soft text-sm w-64 focus:ring-2 focus:ring-slate-800/20 focus:outline-none"
            />
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-full font-bold text-sm shadow-lg shadow-slate-800/30 hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-lg">person_add</span>
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="flex-1 bg-white rounded-lg shadow-soft overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-400 uppercase">
          <div className="w-12"></div>
          <div className="flex-1">Name</div>
          <div className="w-48">Email</div>
          <div className="w-28">Role</div>
          <div className="w-20">Status</div>
          <div className="w-32">Joined</div>
          <div className="w-24 text-right">Actions</div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="size-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 border-b border-slate-50 flex items-center gap-4 hover:bg-slate-50">
                <div className="w-12">
                  {user.avatar ? (
                    <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${user.avatar}')` }} />
                  ) : (
                    <div className={`size-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${roleColors[user.role]}`}>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                </div>
                <div className="w-48 text-sm text-slate-500">{user.email}</div>
                <div className="w-28">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${roleBadgeColors[user.role]}`}>{roleLabels[user.role]}</span>
                </div>
                <div className="w-20">
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600">Active</span>
                </div>
                <div className="w-32 text-sm text-slate-500">{new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                <div className="w-24 flex justify-end gap-1">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowEditModal(true);
                    }}
                    className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDeleteModal(true);
                    }}
                    className="size-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddUser} />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUser}
        user={selectedUser}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
        isLoading={isDeleting}
      />
    </>
  );
}
