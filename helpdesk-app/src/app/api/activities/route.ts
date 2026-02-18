import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/activities - Get activity log
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const ticketId = searchParams.get('ticket_id');
        const userId = searchParams.get('user_id');

        const activities = await prisma.activity.findMany({
            where: {
                ...(ticketId && { ticketId }),
                ...(userId && { userId }),
            },
            include: {
                user: {
                    select: { id: true, name: true, role: true, avatar: true }
                },
                ticket: {
                    select: { id: true, number: true, subject: true }
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
        });

        // Transform to snake_case for frontend compatibility
        const transformedActivities = activities.map(a => ({
            id: a.id,
            action: a.action,
            details: a.details,
            user_id: a.userId,
            ticket_id: a.ticketId,
            created_at: a.createdAt.toISOString(),
            user: a.user,
            ticket: a.ticket,
        }));

        return NextResponse.json({ activities: transformedActivities });


    } catch (error) {
        console.error('Activities API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
