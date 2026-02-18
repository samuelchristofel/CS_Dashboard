import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/performance - Get agent performance metrics
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'month'; // month, week, all

        // Get all non-admin users
        const users = await prisma.user.findMany({
            where: { role: { not: 'admin' } },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
            },
        });

        // Get all tickets for performance calculation
        const tickets = await prisma.ticket.findMany();

        // Calculate date range for period filter
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            default:
                startDate = new Date(0); // All time
        }

        // Filter tickets by period
        const periodTickets = tickets.filter(t =>
            new Date(t.createdAt) >= startDate
        );

        // Calculate performance for each user
        const agents = users.map(user => {
            const userTickets = periodTickets.filter(t => t.assignedToId === user.id);
            const completedTickets = userTickets.filter(t =>
                t.status === 'CLOSED' || t.status === 'RESOLVED' || t.status === 'PENDING_REVIEW'
            );

            // Calculate average handling time (in hours)
            let totalHandlingTime = 0;
            let ticketsWithTime = 0;

            completedTickets.forEach(ticket => {
                if (ticket.assignedAt && ticket.closedAt) {
                    const assignedAt = new Date(ticket.assignedAt).getTime();
                    const closedAt = new Date(ticket.closedAt).getTime();
                    const handlingTimeHours = (closedAt - assignedAt) / (1000 * 60 * 60);
                    if (handlingTimeHours > 0 && handlingTimeHours < 720) { // Exclude outliers (> 30 days)
                        totalHandlingTime += handlingTimeHours;
                        ticketsWithTime++;
                    }
                }
            });

            const avgHandlingTime = ticketsWithTime > 0
                ? totalHandlingTime / ticketsWithTime
                : 0;

            // Format handling time
            let avgTimeFormatted = '-';
            if (avgHandlingTime > 0) {
                if (avgHandlingTime < 1) {
                    avgTimeFormatted = `${Math.round(avgHandlingTime * 60)}m`;
                } else if (avgHandlingTime < 24) {
                    avgTimeFormatted = `${avgHandlingTime.toFixed(1)}h`;
                } else {
                    avgTimeFormatted = `${(avgHandlingTime / 24).toFixed(1)}d`;
                }
            }

            // Calculate score for CS agents (not IT)
            let score = 0;
            if (user.role === 'senior' || user.role === 'junior') {
                // Target: 30 tickets/month for Junior, 40 for Senior
                const target = user.role === 'senior' ? 40 : 30;

                // Base score (60% weight) - completion rate
                const baseScore = Math.min(60, (completedTickets.length / target) * 60);

                // Speed bonus (25% weight) - based on handling time vs targets
                let speedBonus = 0;
                if (ticketsWithTime > 0 && avgHandlingTime > 0) {
                    const avgTarget = 24; // hours
                    if (avgHandlingTime <= avgTarget) {
                        speedBonus = 25;
                    } else if (avgHandlingTime <= avgTarget * 2) {
                        speedBonus = 15;
                    } else {
                        speedBonus = 5;
                    }
                }

                // Quality bonus (15% weight)
                const qualityBonus = 15;

                score = Math.round(Math.min(100, baseScore + speedBonus + qualityBonus));
            }

            // Determine rating
            let rating = '-';
            if (score >= 90) rating = 'Excellent';
            else if (score >= 80) rating = 'Great';
            else if (score >= 70) rating = 'Good';
            else if (score >= 60) rating = 'Needs Improvement';
            else if (score > 0) rating = 'At Risk';

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                metrics: {
                    assigned: userTickets.length,
                    completed: completedTickets.length,
                    avgHandlingTime: avgTimeFormatted,
                    avgHandlingTimeRaw: avgHandlingTime,
                    score: user.role === 'it' ? null : score,
                    rating: user.role === 'it' ? null : rating,
                }
            };
        });

        // Calculate team stats
        const totalResolved = periodTickets.filter(t =>
            t.status === 'CLOSED' || t.status === 'RESOLVED'
        ).length;

        const csAgents = agents.filter(a => a.role !== 'it' && a.metrics.score !== null);
        const overallScore = csAgents.length > 0
            ? Math.round(csAgents.reduce((sum, a) => sum + (a.metrics.score || 0), 0) / csAgents.length)
            : 0;

        // Calculate overall avg resolution time
        let totalTime = 0;
        let totalCount = 0;
        agents.forEach(a => {
            if (a.metrics.avgHandlingTimeRaw > 0) {
                totalTime += a.metrics.avgHandlingTimeRaw * a.metrics.completed;
                totalCount += a.metrics.completed;
            }
        });
        const overallAvgTime = totalCount > 0 ? totalTime / totalCount : 0;
        let overallAvgTimeFormatted = '-';
        if (overallAvgTime > 0) {
            if (overallAvgTime < 1) {
                overallAvgTimeFormatted = `${Math.round(overallAvgTime * 60)}m`;
            } else if (overallAvgTime < 24) {
                overallAvgTimeFormatted = `${overallAvgTime.toFixed(1)}h`;
            } else {
                overallAvgTimeFormatted = `${(overallAvgTime / 24).toFixed(1)}d`;
            }
        }

        return NextResponse.json({
            agents,
            teamStats: {
                totalResolved,
                avgResolutionTime: overallAvgTimeFormatted,
                overallScore,
                totalAgents: agents.length,
            },
            period,
        });

    } catch (error) {
        console.error('Performance API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
