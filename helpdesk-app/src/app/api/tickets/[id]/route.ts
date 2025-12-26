import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/tickets/[id] - Get single ticket with notes
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const { data: ticket, error } = await supabaseAdmin
            .from('tickets')
            .select(`
                *,
                assigned_to:users!tickets_assigned_to_id_fkey(id, name, email, role, avatar),
                created_by:users!tickets_created_by_id_fkey(id, name, email, role),
                notes(id, content, created_at, user:users(id, name, role))
            `)
            .eq('id', id)
            .single();

        if (error || !ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ ticket });

    } catch (error) {
        console.error('Get ticket error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/tickets/[id] - Update ticket
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            subject,
            description,
            priority,
            status,
            assigned_to_id,
            user_id, // The user making the change (for activity log)
        } = body;

        // Get current ticket state for activity logging
        const { data: currentTicket } = await supabaseAdmin
            .from('tickets')
            .select('number, status, assigned_to_id')
            .eq('id', id)
            .single();

        // Build update object
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (subject) updates.subject = subject;
        if (description !== undefined) updates.description = description;
        if (priority) updates.priority = priority;
        if (status) updates.status = status;
        if (assigned_to_id !== undefined) updates.assigned_to_id = assigned_to_id;

        // Handle closing ticket
        if (status === 'CLOSED') {
            updates.closed_at = new Date().toISOString();
        }

        const { data: ticket, error } = await supabaseAdmin
            .from('tickets')
            .update(updates)
            .eq('id', id)
            .select(`
                *,
                assigned_to:users!tickets_assigned_to_id_fkey(id, name, email, role, avatar),
                created_by:users!tickets_created_by_id_fkey(id, name, email, role)
            `)
            .single();

        if (error) {
            console.error('Error updating ticket:', error);
            return NextResponse.json(
                { error: 'Failed to update ticket' },
                { status: 500 }
            );
        }

        // Log activity
        if (user_id && currentTicket) {
            let action = 'TICKET_UPDATED';
            let details = `Ticket #${currentTicket.number} updated`;

            if (status && status !== currentTicket.status) {
                if (status === 'CLOSED') {
                    action = 'TICKET_CLOSED';
                    details = `Ticket #${currentTicket.number} closed`;
                } else if (status === 'RESOLVED') {
                    action = 'TICKET_RESOLVED';
                    details = `Ticket #${currentTicket.number} resolved`;
                } else if (status === 'WITH_IT') {
                    action = 'TICKET_ESCALATED';
                    details = `Ticket #${currentTicket.number} escalated to IT`;
                }
            }

            if (assigned_to_id !== undefined && assigned_to_id !== currentTicket.assigned_to_id) {
                action = 'TICKET_ASSIGNED';
                details = `Ticket #${currentTicket.number} assigned`;
            }

            await supabaseAdmin.from('activities').insert({
                action,
                details,
                user_id,
                ticket_id: id,
            });
        }

        return NextResponse.json({ ticket });

    } catch (error) {
        console.error('Update ticket error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/tickets/[id] - Delete ticket
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('tickets')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting ticket:', error);
            return NextResponse.json(
                { error: 'Failed to delete ticket' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Ticket deleted' });

    } catch (error) {
        console.error('Delete ticket error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
