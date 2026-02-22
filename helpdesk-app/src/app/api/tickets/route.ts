import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Priority, TicketStatus } from '@prisma/client';
import { notifyNewTicketCreated } from '@/lib/notifications';

// GET /api/tickets - List tickets with filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assignedTo = searchParams.get('assigned_to');
        const unassigned = searchParams.get('unassigned');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const tickets = await prisma.ticket.findMany({
            where: {
                ...(status && { status: status as TicketStatus }),
                ...(priority && { priority: priority as Priority }),
                ...(assignedTo && { assignedToId: assignedTo }),
                // Filter for unassigned tickets (no assigned user)
                ...(unassigned === 'true' && { assignedToId: null }),
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, email: true, role: true, avatar: true }
                },
                createdBy: {
                    select: { id: true, name: true, email: true, role: true }
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
        });


        // Transform to match previous API response format (snake_case for assigned_to)
        const transformedTickets = tickets.map(ticket => ({
            ...ticket,
            assigned_to: ticket.assignedTo,
            created_by: ticket.createdBy,
            customer_name: ticket.customerName,
            customer_email: ticket.customerEmail,
            customer_phone: ticket.customerPhone,
            assigned_to_id: ticket.assignedToId,
            created_by_id: ticket.createdById,
            created_at: ticket.createdAt,
            updated_at: ticket.updatedAt,
            assigned_at: ticket.assignedAt,
            closed_at: ticket.closedAt,
        }));

        return NextResponse.json({ tickets: transformedTickets, count: tickets.length });

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
        console.log('[tickets:post] payload received', {
            has_subject: !!body?.subject,
            has_customer_name: !!body?.customer_name,
            source: body?.source,
            created_by_id: body?.created_by_id || null,
        });
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

        // Generate ticket number - get MAX to avoid duplicates
        const lastTicket = await prisma.ticket.findFirst({
            orderBy: { number: 'desc' },
            select: { number: true },
        });

        // Parse the highest ticket number or use default
        let maxNumber = 10000;
        if (lastTicket) {
            const parsed = parseInt(lastTicket.number);
            if (!isNaN(parsed)) {
                maxNumber = parsed;
            }
        }
        const newNumber = (maxNumber + 1).toString();

        // Validate creator id if provided (avoid FK failures)
        let safeCreatedById: string | null = null;
        if (created_by_id) {
            const creator = await prisma.user.findUnique({
                where: { id: created_by_id },
                select: { id: true },
            });
            safeCreatedById = creator?.id || null;
        }

        // Create ticket
        const ticket = await prisma.ticket.create({
            data: {
                number: newNumber,
                subject,
                description: description || null,
                priority: priority || 'MEDIUM',
                status: 'OPEN',
                source: source || 'Freshchat',
                customerName: customer_name,
                customerEmail: customer_email || null,
                customerPhone: customer_phone || null,
                assignedToId: assigned_to_id || null,
                createdById: safeCreatedById,
            },
            include: {
                assignedTo: {
                    select: { id: true, name: true, email: true, role: true, avatar: true }
                },
                createdBy: {
                    select: { id: true, name: true, email: true, role: true }
                },
            },
        });

        // Log activity
        const creator = safeCreatedById
            ? await prisma.user.findUnique({
                  where: { id: safeCreatedById },
                  select: { id: true, name: true },
              })
            : null;

        let activityUserId = creator?.id || null;
        if (!activityUserId) {
            const fallbackUser = await prisma.user.findFirst({
                where: { role: 'admin' },
                select: { id: true, name: true },
            });
            activityUserId = fallbackUser?.id || null;
        }

        if (activityUserId) {
            const channel = ticket.source || 'Freshchat';
            const createdDetails =
                channel === 'Freshchat'
                    ? `Ticket #${newNumber} created from Freshchat${creator?.name ? ` by ${creator.name}` : ' by System'}`
                    : `Ticket #${newNumber} created manually via ${channel}${creator?.name ? ` by ${creator.name}` : ''}`;

            try {
                await prisma.activity.create({
                    data: {
                        action: 'TICKET_CREATED',
                        details: createdDetails,
                        userId: activityUserId,
                        ticketId: ticket.id,
                    },
                });
            } catch (activityError) {
                console.error('Activity creation failed after ticket create:', activityError);
            }
        }

        try {
            await notifyNewTicketCreated({
                id: ticket.id,
                number: ticket.number,
                subject: ticket.subject,
                customerName: ticket.customerName,
            });
        } catch (notifError) {
            console.error('Notification creation failed:', notifError);
            // Do not block ticket creation on notification failures
        }

        // Transform response
        const transformedTicket = {
            ...ticket,
            assigned_to: ticket.assignedTo,
            created_by: ticket.createdBy,
            customer_name: ticket.customerName,
            customer_email: ticket.customerEmail,
            customer_phone: ticket.customerPhone,
            assigned_to_id: ticket.assignedToId,
            created_by_id: ticket.createdById,
            created_at: ticket.createdAt,
            updated_at: ticket.updatedAt,
        };

        return NextResponse.json({ ticket: transformedTicket }, { status: 201 });

    } catch (error) {
        console.error('Create ticket error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
