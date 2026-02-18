import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/users - List all users
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Transform to snake_case for frontend compatibility
        const transformedUsers = users.map(u => ({
            ...u,
            created_at: u.createdAt.toISOString(),
        }));

        return NextResponse.json({ users: transformedUsers });

    } catch (error) {
        console.error('Users API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/users - Create new user
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role, avatar } = body;

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existing = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        // Create user (plain text password for demo - use bcrypt in production)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
                role: role || 'junior',
                avatar: avatar || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
            },
        });

        // Transform to snake_case
        const transformedUser = {
            ...user,
            created_at: user.createdAt.toISOString(),
        };

        return NextResponse.json({ user: transformedUser }, { status: 201 });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
