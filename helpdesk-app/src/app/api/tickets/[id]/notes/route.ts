import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/tickets/[id]/notes - Get notes for a ticket
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const { data: notes, error } = await supabaseAdmin
            .from('notes')
            .select(`
                id,
                content,
                created_at,
                user:users(id, name, role, avatar)
            `)
            .eq('ticket_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notes:', error);
            return NextResponse.json(
                { error: 'Failed to fetch notes' },
                { status: 500 }
            );
        }

        return NextResponse.json({ notes });

    } catch (error) {
        console.error('Notes API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/tickets/[id]/notes - Add note to ticket
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { content, user_id } = body;

        // Validation
        if (!content || !user_id) {
            return NextResponse.json(
                { error: 'Content and user_id are required' },
                { status: 400 }
            );
        }

        // Verify ticket exists
        const { data: ticket } = await supabaseAdmin
            .from('tickets')
            .select('id, number')
            .eq('id', id)
            .single();

        if (!ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        // Create note
        const { data: note, error } = await supabaseAdmin
            .from('notes')
            .insert({
                content,
                user_id,
                ticket_id: id,
            })
            .select(`
                id,
                content,
                created_at,
                user:users(id, name, role, avatar)
            `)
            .single();

        if (error) {
            console.error('Error creating note:', error);
            return NextResponse.json(
                { error: 'Failed to create note' },
                { status: 500 }
            );
        }

        // Log activity
        await supabaseAdmin.from('activities').insert({
            action: 'NOTE_ADDED',
            details: `Note added to ticket #${ticket.number}`,
            user_id,
            ticket_id: id,
        });

        return NextResponse.json({ note }, { status: 201 });

    } catch (error) {
        console.error('Create note error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
