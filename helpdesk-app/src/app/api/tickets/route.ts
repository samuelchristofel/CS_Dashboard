import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/tickets - List tickets with filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assignedTo = searchParams.get('assigned_to');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabaseAdmin
            .from('tickets')
            .select(`
                *,
                assigned_to:users!tickets_assigned_to_id_fkey(id, name, email, role, avatar),
                created_by:users!tickets_created_by_id_fkey(id, name, email, role)
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }
        if (priority) {
            query = query.eq('priority', priority);
        }
        if (assignedTo) {
            query = query.eq('assigned_to_id', assignedTo);
        }

        const { data: tickets, error, count } = await query;

        if (error) {
            console.error('Error fetching tickets:', error);
            return NextResponse.json(
                { error: 'Failed to fetch tickets' },
                { status: 500 }
            );
        }

        return NextResponse.json({ tickets, count });

    } catch (error) {
        console.error('Tickets API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/tickets - Create new ticket
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            subject,
            description,
            priority,
            source,
            customer_name,
            customer_email,
            customer_phone,
            assigned_to_id,
            created_by_id,
        } = body;

        // Validation
        if (!subject || !customer_name) {
            return NextResponse.json(
                { error: 'Subject and customer name are required' },
                { status: 400 }
            );
        }

        // Generate ticket number
        const { data: lastTicket } = await supabaseAdmin
            .from('tickets')
            .select('number')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        const lastNumber = lastTicket ? parseInt(lastTicket.number) : 8815;
        const newNumber = (lastNumber + 1).toString();

        // Create ticket
        const { data: ticket, error } = await supabaseAdmin
            .from('tickets')
            .insert({
                number: newNumber,
                subject,
                description: description || null,
                priority: priority || 'MEDIUM',
                status: 'OPEN',
                source: source || 'Freshchat',
                customer_name,
                customer_email: customer_email || null,
                customer_phone: customer_phone || null,
                assigned_to_id: assigned_to_id || null,
                assigned_at: assigned_to_id ? new Date().toISOString() : null,
                created_by_id: created_by_id || null,
            })
            .select(`
                *,
                assigned_to:users!tickets_assigned_to_id_fkey(id, name, email, role, avatar),
                created_by:users!tickets_created_by_id_fkey(id, name, email, role)
            `)
            .single();

        if (error) {
            console.error('Error creating ticket:', error);
            return NextResponse.json(
                { error: 'Failed to create ticket' },
                { status: 500 }
            );
        }

        // Log activity
        if (created_by_id) {
            await supabaseAdmin.from('activities').insert({
                action: 'TICKET_CREATED',
                details: `Ticket #${newNumber} created`,
                user_id: created_by_id,
                ticket_id: ticket.id,
            });
        }

        return NextResponse.json({ ticket }, { status: 201 });

    } catch (error) {
        console.error('Create ticket error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
