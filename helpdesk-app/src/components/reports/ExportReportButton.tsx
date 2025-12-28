'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import SeniorReportPDF from './SeniorReportPDF';

interface PersonalStats {
    ticketsHandled: number;
    avgResolutionTime: string;
    activeTickets: number;
    performanceScore: number;
}

interface TeamStats {
    totalJuniors: number;
    teamDone: number;
    avgTime: string;
    avgScore: number;
    active: number;
    resRate: string;
    assigned: number;
    topScore: number;
}

interface JuniorData {
    name: string;
    completed: number;
    avgTime: string;
    score: number | null;
    rating: string | null;
}

interface ExportReportButtonProps {
    userName: string;
    period: string;
    personalStats: PersonalStats;
    teamStats: TeamStats;
    juniors: JuniorData[];
    disabled?: boolean;
}

export default function ExportReportButton({
    userName,
    period,
    personalStats,
    teamStats,
    juniors,
    disabled = false,
}: ExportReportButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleExport = async () => {
        if (disabled || isGenerating) return;

        setIsGenerating(true);
        try {
            const doc = (
                <SeniorReportPDF
                    userName={userName}
                    period={period}
                    personalStats={personalStats}
                    teamStats={teamStats}
                    juniors={juniors}
                />
            );

            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `senior-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (disabled) {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-300 text-slate-500 rounded-full font-bold text-sm cursor-not-allowed"
            >
                <span className="material-symbols-outlined text-lg">download</span>
                Export
            </button>
        );
    }

    return (
        <button
            onClick={handleExport}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#EB4C36] text-white rounded-full font-bold text-sm shadow-lg shadow-[#EB4C36]/30 hover:bg-[#d43d28] transition-colors disabled:opacity-70"
        >
            <span className="material-symbols-outlined text-lg">
                {isGenerating ? 'hourglass_empty' : 'download'}
            </span>
            {isGenerating ? 'Generating...' : 'Export'}
        </button>
    );
}
