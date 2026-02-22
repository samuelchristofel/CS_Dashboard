"use client";

import { useState, useEffect, useRef } from "react";
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

const OTHER_SUBJECT_VALUE = "__OTHER__";

const subjectGroups = [
  {
    label: "DEVICE ISSUES",
    options: ["Unit GPS offline / tidak mengirim sinyal", "GPS tidak akurat / posisi melenceng", "Tombol SOS tidak berfungsi", "Layar/display unit rusak", "Unit GPS mati / tidak menyala", "Sensor tidak terbaca (suhu, bahan bakar, dll)"],
  },
  {
    label: "PLATFORM / DASHBOARD ISSUES",
    options: ["Tidak bisa login ke dashboard", "Dashboard error / tidak bisa dibuka", "Data kendaraan tidak muncul", "Laporan tidak bisa didownload", "Notifikasi/alert tidak masuk", "Fitur geofence tidak berfungsi"],
  },
  {
    label: "INSTALLATION & HARDWARE",
    options: ["Request instalasi GPS baru", "Permintaan penambahan unit", "Request relokasi/pindah unit", "Perangkat rusak / perlu penggantian", "Kalibrasi sensor bahan bakar"],
  },
  {
    label: "SUBSCRIPTION & BILLING",
    options: ["Perpanjangan kontrak/langganan", "Perubahan paket layanan", "Pertanyaan tagihan / invoice", "Aktivasi unit baru"],
  },
  {
    label: "TRAINING & ONBOARDING",
    options: ["Request pelatihan penggunaan platform", "Panduan fitur baru", "Onboarding karyawan baru"],
  },
  {
    label: "OTHER",
    options: ["Lainnya (isi manual)"],
  },
];

const predefinedSubjects = subjectGroups.flatMap((group) => group.options).filter((subject) => subject !== "Lainnya (isi manual)");

export default function CreateTicketModal({ isOpen, onClose, onSubmit, initialData, mode = "create" }: CreateTicketModalProps) {
  const [formData, setFormData] = useState<TicketFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof TicketFormData, string>>>({});
  const [selectedSubject, setSelectedSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState("");
  const subjectDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
      if (predefinedSubjects.includes(initialData.subject)) {
        setSelectedSubject(initialData.subject);
        setCustomSubject("");
      } else if (initialData.subject.trim()) {
        setSelectedSubject(OTHER_SUBJECT_VALUE);
        setCustomSubject(initialData.subject);
      } else {
        setSelectedSubject("");
        setCustomSubject("");
      }
    } else if (isOpen && mode === "create") {
      setFormData(initialFormData);
      setSelectedSubject("");
      setCustomSubject("");
    }
  }, [isOpen, initialData, mode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!subjectDropdownRef.current) return;
      if (!subjectDropdownRef.current.contains(event.target as Node)) {
        setIsSubjectOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TicketFormData, string>> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Customer email is required";
    }
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required";
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
      setSelectedSubject("");
      setCustomSubject("");
    }
    setIsSubjectOpen(false);
    setSubjectSearch("");
    setErrors({});
    onClose();
  };

  const filteredSubjectGroups = subjectGroups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => option.toLowerCase().includes(subjectSearch.toLowerCase())),
    }))
    .filter((group) => group.options.length > 0);

  const selectedSubjectLabel = selectedSubject === OTHER_SUBJECT_VALUE ? "Lainnya (isi manual)" : selectedSubject;

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
            <div ref={subjectDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsSubjectOpen((prev) => !prev)}
                className={`w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none text-left flex items-center justify-between ${errors.subject ? "ring-2 ring-red-500" : ""}`}
              >
                <span className={`${selectedSubject ? "text-slate-700" : "text-slate-400"}`}>{selectedSubject ? selectedSubjectLabel : "Pilih atau cari kategori masalah..."}</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="material-symbols-outlined text-sm">search</span>
                  <span className={`material-symbols-outlined text-base transition-transform ${isSubjectOpen ? "rotate-180" : ""}`}>expand_more</span>
                </span>
              </button>

              <div className={`absolute left-0 right-0 mt-2 z-50 transition-all duration-200 origin-top ${isSubjectOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"}`}>
                <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                  <div className="p-3 border-b border-slate-100">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                      <input
                        type="text"
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                        placeholder="Cari kategori..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {filteredSubjectGroups.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-400">Tidak ada kategori ditemukan</p>
                    ) : (
                      filteredSubjectGroups.map((group, groupIndex) => (
                        <div key={group.label} className={groupIndex === 0 ? "" : "border-t border-slate-100"}>
                          <p className="px-4 py-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">{group.label}</p>
                          {group.options.map((option) => {
                            const optionValue = option === "Lainnya (isi manual)" ? OTHER_SUBJECT_VALUE : option;
                            const isSelected = selectedSubject === optionValue;

                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setSelectedSubject(optionValue);
                                  if (optionValue === OTHER_SUBJECT_VALUE) {
                                    setFormData({ ...formData, subject: customSubject });
                                  } else {
                                    setCustomSubject("");
                                    setFormData({ ...formData, subject: optionValue });
                                  }
                                  setIsSubjectOpen(false);
                                  setSubjectSearch("");
                                }}
                                className={`w-full px-4 py-3 text-left text-sm text-slate-700 flex items-center justify-between hover:bg-[#EB4C36]/5 transition-colors ${isSelected ? "bg-[#EB4C36]/10" : ""}`}
                              >
                                <span className="pl-3">{option}</span>
                                {isSelected && <span className="material-symbols-outlined text-base text-[#EB4C36]">check</span>}
                              </button>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`transition-all duration-200 overflow-hidden ${selectedSubject === OTHER_SUBJECT_VALUE ? "max-h-28 opacity-100 translate-y-0 mt-2" : "max-h-0 opacity-0 -translate-y-1"}`}>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomSubject(value);
                  setFormData({ ...formData, subject: value });
                }}
                placeholder="Brief description of the issue"
                className={`w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none ${errors.subject ? "ring-2 ring-red-500" : ""}`}
              />
            </div>
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
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Company or person name"
                className={`w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none ${errors.customerName ? "ring-2 ring-red-500" : ""}`}
              />
              {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <span className="material-symbols-outlined text-slate-400 text-sm">phone</span>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="08xx-xxxx-xxxx"
                className={`w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#EB4C36]/20 focus:outline-none ${errors.customerPhone ? "ring-2 ring-red-500" : ""}`}
              />
              {errors.customerPhone && <p className="text-xs text-red-500 mt-1">{errors.customerPhone}</p>}
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
