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
            const userTickets = allTickets?.filter(t => t.assigned_to_id === userId) || [];
            const closedByUser = allTickets?.filter(t =>
                t.assigned_to_id === userId &&
                (t.status === 'CLOSED' || t.status === 'RESOLVED')
            ).length || 0;

            userStats = {
                assigned: userTickets.length,
                active: userTickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length,
                closed: closedByUser,
                // Score calculation (simplified)
                score: Math.min(100, Math.round((closedByUser / Math.max(1, userTickets.length)) * 100) + 50),
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
