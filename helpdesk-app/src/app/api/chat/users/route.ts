import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/chat/users - Get all users for chat (except current user)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const excludeId = searchParams.get('exclude_id');

        const users = await prisma.user.findMany({
            where: excludeId ? { id: { not: excludeId } } : {},
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Chat users API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
