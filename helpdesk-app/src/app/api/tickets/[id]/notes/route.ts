import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { notifyNoteAdded } from '@/lib/notifications';

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
        const notes = await prisma.note.findMany({
            where: {
                ticketId: id,
                userId: userId,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Transform to snake_case
        const transformedNotes = notes.map(n => ({
            id: n.id,
            content: n.content,
            user_id: n.userId,
            ticket_id: n.ticketId,
            created_at: n.createdAt.toISOString(),
        }));

        return NextResponse.json({ notes: transformedNotes });
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
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            select: { id: true, number: true, subject: true, assignedToId: true },
        });

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
        const note = await prisma.note.create({
            data: {
                content: noteContent,
                userId: user_id,
                ticketId: id,
            },
        });

        await prisma.activity.create({
            data: {
                action: 'NOTE_ADDED',
                details: `Note added to ticket #${ticket.number}`,
                userId: user_id,
                ticketId: id,
            },
        });

        await notifyNoteAdded(
            {
                id: ticket.id,
                number: ticket.number,
                subject: ticket.subject,
                assignedToId: ticket.assignedToId,
            },
            user_id,
        );

        // Transform to snake_case
        const transformedNote = {
            id: note.id,
            content: note.content,
            user_id: note.userId,
            ticket_id: note.ticketId,
            created_at: note.createdAt.toISOString(),
        };

        return NextResponse.json({ note: transformedNote }, { status: 201 });
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

        // Update note content - ensure user owns the note
        const note = await prisma.note.updateMany({
            where: {
                id: note_id,
                userId: user_id,
                ticketId: id,
            },
            data: { content },
        });

        if (note.count === 0) {
            return NextResponse.json(
                { error: 'Note not found or unauthorized' },
                { status: 404 }
            );
        }

        // Fetch the updated note
        const updatedNote = await prisma.note.findUnique({
            where: { id: note_id },
        });

        // Transform to snake_case
        const transformedNote = updatedNote ? {
            id: updatedNote.id,
            content: updatedNote.content,
            user_id: updatedNote.userId,
            ticket_id: updatedNote.ticketId,
            created_at: updatedNote.createdAt.toISOString(),
        } : null;

        return NextResponse.json({ note: transformedNote });
    } catch (error) {
        console.error('PATCH note error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
