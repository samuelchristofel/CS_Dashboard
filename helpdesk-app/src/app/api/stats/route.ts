import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/stats - Get dashboard statistics
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const role = searchParams.get('role');

        // Get ticket counts by status
        const { data: allTickets, error: ticketsError } = await supabaseAdmin
            .from('tickets')
            .select('id, status, priority, assigned_to_id');

        if (ticketsError) {
            console.error('Error fetching tickets:', ticketsError);
            return NextResponse.json(
                { error: 'Failed to fetch stats' },
                { status: 500 }
            );
        }

        // Calculate stats
        const stats = {
            total: allTickets?.length || 0,
            open: allTickets?.filter(t => t.status === 'OPEN').length || 0,
            inProgress: allTickets?.filter(t => t.status === 'IN_PROGRESS').length || 0,
            pendingReview: allTickets?.filter(t => t.status === 'PENDING_REVIEW').length || 0,
            withIT: allTickets?.filter(t => t.status === 'WITH_IT').length || 0,
            resolved: allTickets?.filter(t => t.status === 'RESOLVED').length || 0,
            closed: allTickets?.filter(t => t.status === 'CLOSED').length || 0,
            high: allTickets?.filter(t => t.priority === 'HIGH' && t.status !== 'CLOSED').length || 0,
            medium: allTickets?.filter(t => t.priority === 'MEDIUM' && t.status !== 'CLOSED').length || 0,
            low: allTickets?.filter(t => t.priority === 'LOW' && t.status !== 'CLOSED').length || 0,
        };

        // If user_id provided, also get user-specific stats
        let userStats = null;
        if (userId) {
            // Need to fetch timestamps for accurate scoring
            const { data: userTicketData } = await supabaseAdmin
                .from('tickets')
                .select('id, status, assigned_at, closed_at')
                .eq('assigned_to_id', userId);

            const userTickets = userTicketData || [];
            const completedTickets = userTickets.filter(t =>
                t.status === 'CLOSED' || t.status === 'RESOLVED' || t.status === 'PENDING_REVIEW'
            );
            const closedByUser = completedTickets.length;

            // Calculate score using new KPI logic
            // Target: 30 tickets (Junior) or 40 (Senior) - generic 35 for now
            const target = 35;

            // 1. Base Score (60%)
            const baseScore = Math.min(60, (closedByUser / target) * 60);

            // 2. Speed Bonus (25%)
            let speedBonus = 0;
            let totalHandlingTime = 0;
            let ticketsWithTime = 0;

            completedTickets.forEach(t => {
                if (t.assigned_at && t.closed_at) {
                    const time = new Date(t.closed_at).getTime() - new Date(t.assigned_at).getTime();
                    const hours = time / (1000 * 60 * 60);
                    if (hours > 0 && hours < 720) {
                        totalHandlingTime += hours;
                        ticketsWithTime++;
                    }
                }
            });

            if (ticketsWithTime > 0) {
                const avgTime = totalHandlingTime / ticketsWithTime;
                // Target generic 24h
                if (avgTime <= 24) speedBonus = 25;
                else if (avgTime <= 48) speedBonus = 15;
                else speedBonus = 5;
            }

            // 3. Quality Bonus (15%) - Assuming 100% for now
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

        return NextResponse.json({ stats, userStats });

    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
