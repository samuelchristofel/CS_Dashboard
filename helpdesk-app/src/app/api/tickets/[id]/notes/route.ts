import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/tickets/[id]/notes - Get notes for a ticket (filtered by user)
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            );
        }

        // Get notes for this ticket by this user only (private notes)
        const { data: notes, error } = await supabaseAdmin
            .from('notes')
            .select('*')
            .eq('ticket_id', id)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notes:', error);
            return NextResponse.json(
                { error: 'Failed to fetch notes' },
                { status: 500 }
            );
        }

        return NextResponse.json({ notes: notes || [] });
    } catch (error) {
        console.error('GET notes error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/tickets/[id]/notes - Add a note to ticket
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, content, checklist_items, user_id } = body;

        // Validation
        if (!title || !user_id) {
            return NextResponse.json(
                { error: 'Title and user_id are required' },
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

        // Store note with title in content as JSON structure
        const noteContent = JSON.stringify({
            title,
            content: content || '',
            checklist_items: checklist_items || []
        });

        // Create note
        const { data: note, error } = await supabaseAdmin
            .from('notes')
            .insert({
                content: noteContent,
                user_id,
                ticket_id: id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating note:', error);
            return NextResponse.json(
                { error: 'Failed to create note' },
                { status: 500 }
            );
        }

        return NextResponse.json({ note }, { status: 201 });
    } catch (error) {
        console.error('POST note error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/tickets/[id]/notes - Update a note (for checklist toggle)
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { note_id, content, user_id } = body;

        if (!note_id || !user_id) {
            return NextResponse.json(
                { error: 'note_id and user_id are required' },
                { status: 400 }
            );
        }

        // Update note content
        const { data: note, error } = await supabaseAdmin
            .from('notes')
            .update({ content })
            .eq('id', note_id)
            .eq('user_id', user_id) // Ensure user owns the note
            .eq('ticket_id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating note:', error);
            return NextResponse.json(
                { error: 'Failed to update note' },
                { status: 500 }
            );
        }

        return NextResponse.json({ note });
    } catch (error) {
        console.error('PATCH note error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
