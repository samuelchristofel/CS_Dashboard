"use client";

import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import CustomSelect from "../ui/CustomSelect";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TicketFormData) => Promise<void>;
  initialData?: TicketFormData | null;
  mode?: "create" | "edit";
}

export interface TicketFormData {
  subject: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  source: "Freshchat" | "WhatsApp" | "Email" | "Phone";
}

const initialFormData: TicketFormData = {
  subject: "",
  description: "",
  priority: "MEDIUM",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  source: "Freshchat",
};

export default function CreateTicketModal({ isOpen, onClose, onSubmit, initialData, mode = "create" }: CreateTicketModalProps) {
  const [formData, setFormData] = useState<TicketFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof TicketFormData, string>>>({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (isOpen && mode === "create") {
      setFormData(initialFormData);
    }
  }, [isOpen, initialData, mode]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TicketFormData, string>> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Customer email is required";
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
      if (mode === "create") {
        setFormData(initialFormData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save ticket:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (mode === "create") {
      setFormData(initialFormData);
    }
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={mode === "edit" ? "Edit Ticket" : "Create New Ticket"} size="2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Subject | Priority */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <span className="material-symbols-outlined text-slate-400 text-sm">subject</span>
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief description of the issue"
              className={`w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none ${errors.subject ? "ring-2 ring-red-500" : ""}`}
            />
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
          </div>

          <CustomSelect
            label="Priority"
            icon="flag"
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as TicketFormData["priority"] })}
            options={[
              { value: "HIGH", label: "High Priority" },
              { value: "MEDIUM", label: "Medium Priority" },
              { value: "LOW", label: "Low Priority" },
            ]}
          />
        </div>

        {/* Row 2: Description | Source */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <span className="material-symbols-outlined text-slate-400 text-sm">description</span>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Full details of the issue..."
              rows={5}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none resize-none"
            />
          </div>

          <CustomSelect
            label="Source"
            icon="source"
            value={formData.source}
            onChange={(value) => setFormData({ ...formData, source: value as TicketFormData["source"] })}
            options={[
              { value: "Freshchat", label: "Freshchat" },
              { value: "WhatsApp", label: "WhatsApp" },
              { value: "Email", label: "Email" },
              { value: "Phone", label: "Phone" },
            ]}
          />
        </div>

        {/* Customer Information Section */}
        <div className="pt-4">
          <p className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-base">person</span>
            Customer Information
          </p>

          {/* Row 3: Customer Email | Customer Name | Phone Number */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <span className="material-symbols-outlined text-slate-400 text-sm">mail</span>
                Customer Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="customer@email.com"
                className={`w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none ${errors.customerEmail ? "ring-2 ring-red-500" : ""}`}
              />
              {errors.customerEmail && <p className="text-xs text-red-500 mt-1">{errors.customerEmail}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <span className="material-symbols-outlined text-slate-400 text-sm">badge</span>
                Customer Name
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Company or person name"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <span className="material-symbols-outlined text-slate-400 text-sm">phone</span>
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="08xx-xxxx-xxxx"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={handleClose} disabled={isLoading} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="flex-1 px-4 py-3 bg-[#EB4C36] text-white rounded-xl font-bold shadow-lg shadow-[#EB4C36]/30 hover:bg-[#d13a25] transition-colors disabled:opacity-50">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === "edit" ? "Saving..." : "Creating..."}
              </span>
            ) : mode === "edit" ? (
              "Save Changes"
            ) : (
              "Create Ticket"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
