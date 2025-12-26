'use client';

import { useState, useRef, useEffect } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    icon?: string;
    required?: boolean;
}

export default function CustomSelect({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    label,
    icon,
    required,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    {icon && (
                        <span className="material-symbols-outlined text-sm text-slate-400">{icon}</span>
                    )}
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-slate-50 rounded-xl text-left flex items-center justify-between transition-all
                    ${isOpen ? 'ring-2 ring-[#EB4C36]/20' : 'hover:bg-slate-100'}
                    ${!selectedOption ? 'text-slate-400' : 'text-slate-900'}
                `}
            >
                <span className="text-sm font-medium">
                    {selectedOption?.label || placeholder}
                </span>
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-40 overflow-y-auto p-2">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2.5 text-left text-sm font-medium transition-all flex items-center gap-2 rounded-lg
                                    ${value === option.value
                                        ? 'bg-[#EB4C36] text-white'
                                        : 'text-slate-700 hover:bg-slate-100'
                                    }
                                `}
                            >
                                {option.label}
                                {value === option.value && (
                                    <span className="material-symbols-outlined text-base ml-auto">check</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
