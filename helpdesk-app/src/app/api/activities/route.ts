import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/activities - Get activity log
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const ticketId = searchParams.get('ticket_id');
        const userId = searchParams.get('user_id');

        let query = supabaseAdmin
            .from('activities')
            .select(`
                id,
                action,
                details,
                created_at,
                user:users(id, name, role, avatar),
                ticket:tickets(id, number, subject)
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (ticketId) {
            query = query.eq('ticket_id', ticketId);
        }
        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data: activities, error } = await query;

        if (error) {
            console.error('Error fetching activities:', error);
            return NextResponse.json(
                { error: 'Failed to fetch activities' },
                { status: 500 }
            );
        }

        return NextResponse.json({ activities });

    } catch (error) {
        console.error('Activities API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
