import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/stats - Get dashboard statistics
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const role = searchParams.get('role');
        const period = searchParams.get('period') || 'month'; // today, week, month, year

        // Calculate date range for period filter
        const now = new Date();
        let startDate: Date | null = null;
        let trendConfig: { months: number; label: string } = { months: 6, label: 'Last 6 months' };

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                trendConfig = { months: 1, label: 'Today' };
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                trendConfig = { months: 1, label: 'Last 7 days' };
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                trendConfig = { months: 4, label: 'Last 4 weeks' };
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                trendConfig = { months: 12, label: 'This Year' };
                break;
            default:
                startDate = null;
                trendConfig = { months: 6, label: 'Last 6 months' };
        }

        // Get ticket counts by status
        const allTickets = await prisma.ticket.findMany({
            where: startDate ? { createdAt: { gte: startDate } } : {},
            select: {
                id: true,
                status: true,
                priority: true,
                assignedToId: true,
                createdAt: true,
                assignedAt: true,
                closedAt: true,
            },
        });

        // Fetch tickets for trend calculation based on period
        const trendStartDate = new Date();
        trendStartDate.setMonth(trendStartDate.getMonth() - trendConfig.months);

        const trendTickets = await prisma.ticket.findMany({
            where: {
                closedAt: { gte: trendStartDate },
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                assignedAt: true,
                closedAt: true,
            },
        });

        // Calculate trend data based on period
        const trends = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();

        if (period === 'today' || period === 'week') {
            // For today/week: show last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en', { weekday: 'short' });

                const ticketsOnDay = trendTickets.filter(t => {
                    if (!t.closedAt) return false;
                    const closeDate = new Date(t.closedAt);
                    return closeDate.toDateString() === date.toDateString();
                });

                let totalHours = 0;
                let count = 0;

                ticketsOnDay.forEach(t => {
                    const start = t.assignedAt ? new Date(t.assignedAt) : new Date(t.createdAt);
                    const end = new Date(t.closedAt!);
                    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    if (hours > 0 && hours < 720) {
                        totalHours += hours;
                        count++;
                    }
                });

                trends.push({
                    name: dayLabel,
                    avgHours: count > 0 ? Math.round(totalHours / count) : 0,
                    tickets: count
                });
            }
        } else {
            // For month/year: show months
            for (let i = trendConfig.months - 1; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthIndex = date.getMonth();
                const year = date.getFullYear();
                const monthLabel = monthNames[monthIndex];

                const ticketsInMonth = trendTickets.filter(t => {
                    if (!t.closedAt) return false;
                    const closeDate = new Date(t.closedAt);
                    return closeDate.getMonth() === monthIndex && closeDate.getFullYear() === year;
                });

                let totalHours = 0;
                let count = 0;

                ticketsInMonth.forEach(t => {
                    const start = t.assignedAt ? new Date(t.assignedAt) : new Date(t.createdAt);
                    const end = new Date(t.closedAt!);
                    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    if (hours > 0 && hours < 720) {
                        totalHours += hours;
                        count++;
                    }
                });

                trends.push({
                    name: monthLabel,
                    avgHours: count > 0 ? Math.round(totalHours / count) : 0,
                    tickets: count
                });
            }
        }

        // Calculate stats
        const stats = {
            total: allTickets.length,
            open: allTickets.filter(t => t.status === 'OPEN').length,
            inProgress: allTickets.filter(t => t.status === 'IN_PROGRESS').length,
            pendingReview: allTickets.filter(t => t.status === 'PENDING_REVIEW').length,
            withIT: allTickets.filter(t => t.status === 'WITH_IT').length,
            resolved: allTickets.filter(t => t.status === 'RESOLVED').length,
            closed: allTickets.filter(t => t.status === 'CLOSED').length,
            high: allTickets.filter(t => t.priority === 'HIGH' && t.status !== 'CLOSED').length,
            medium: allTickets.filter(t => t.priority === 'MEDIUM' && t.status !== 'CLOSED').length,
            low: allTickets.filter(t => t.priority === 'LOW' && t.status !== 'CLOSED').length,
        };

        // If user_id provided, also get user-specific stats
        let userStats = null;
        if (userId) {
            const userTickets = await prisma.ticket.findMany({
                where: { assignedToId: userId },
            });

            const completedTickets = userTickets.filter(t =>
                t.status === 'CLOSED' || t.status === 'RESOLVED' || t.status === 'PENDING_REVIEW'
            );
            const closedByUser = completedTickets.length;

            // Calculate score using KPI logic
            const target = 35;

            // 1. Base Score (60%)
            const baseScore = Math.min(60, (closedByUser / target) * 60);

            // 2. Speed Bonus (25%)
            let speedBonus = 0;
            let totalHandlingTime = 0;
            let ticketsWithTime = 0;

            completedTickets.forEach(t => {
                if (t.assignedAt && t.closedAt) {
                    const time = new Date(t.closedAt).getTime() - new Date(t.assignedAt).getTime();
                    const hours = time / (1000 * 60 * 60);
                    if (hours > 0 && hours < 720) {
                        totalHandlingTime += hours;
                        ticketsWithTime++;
                    }
                }
            });

            if (ticketsWithTime > 0) {
                const avgTime = totalHandlingTime / ticketsWithTime;
                if (avgTime <= 24) speedBonus = 25;
                else if (avgTime <= 48) speedBonus = 15;
                else speedBonus = 5;
            }

            // 3. Quality Bonus (15%)
            const qualityBonus = 15;

            // IT Support doesn't get a score
            const score = role === 'it' ? 0 : Math.round(Math.min(100, baseScore + speedBonus + qualityBonus));

            userStats = {
                assigned: userTickets.length,
                active: userTickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length,
                closed: closedByUser,
                score,
            };
        }

        return NextResponse.json({ stats, userStats, trends });
    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
