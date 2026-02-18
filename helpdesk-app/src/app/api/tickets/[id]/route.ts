import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { TicketStatus } from '@prisma/client';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/tickets/[id] - Get single ticket with notes
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                assignedTo: {
                    select: { id: true, name: true, email: true, role: true, avatar: true }
                },
                createdBy: {
                    select: { id: true, name: true, email: true, role: true }
                },
                notes: {
                    include: {
                        user: {
                            select: { id: true, name: true, role: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
            },
        });

        if (!ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        // Transform to match previous API response format
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
            assigned_at: ticket.assignedAt,
            closed_at: ticket.closedAt,
        };

        return NextResponse.json({ ticket: transformedTicket });

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
        const currentTicket = await prisma.ticket.findUnique({
            where: { id },
            select: { number: true, status: true, assignedToId: true },
        });

        if (!currentTicket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        // Build update object
        const updates: Record<string, unknown> = { updatedAt: new Date() };
        if (subject) updates.subject = subject;
        if (description !== undefined) updates.description = description;
        if (priority) updates.priority = priority;
        if (status) updates.status = status as TicketStatus;
        if (assigned_to_id !== undefined) {
            updates.assignedToId = assigned_to_id;
            // Track when ticket gets assigned for resolution time calculation
            if (assigned_to_id !== currentTicket.assignedToId) {
                updates.assignedAt = new Date();
            }
        }

        // Track closing time for resolution metrics
        if (status === 'CLOSED' || status === 'RESOLVED') {
            updates.closedAt = new Date();
        }

        const ticket = await prisma.ticket.update({
            where: { id },
            data: updates,
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

            if (assigned_to_id !== undefined && assigned_to_id !== currentTicket.assignedToId) {
                action = 'TICKET_ASSIGNED';
                details = `Ticket #${currentTicket.number} assigned`;
            }

            await prisma.activity.create({
                data: {
                    action,
                    details,
                    userId: user_id,
                    ticketId: id,
                },
            });
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
            assigned_at: ticket.assignedAt,
            closed_at: ticket.closedAt,
        };

        return NextResponse.json({ ticket: transformedTicket });

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

        await prisma.ticket.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Ticket deleted' });

    } catch (error) {
        console.error('Delete ticket error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
