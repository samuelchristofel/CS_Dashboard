import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/users - List all users
export async function GET() {
    try {
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, role, avatar, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json(
                { error: 'Failed to fetch users' },
                { status: 500 }
            );
        }

        return NextResponse.json({ users });

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
        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        // Create user (plain text password for demo - use bcrypt in production)
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert({
                name,
                email,
                password,
                role: role || 'junior',
                avatar: avatar || null,
            })
            .select('id, name, email, role, avatar, created_at')
            .single();

        if (error) {
            console.error('Error creating user:', error);
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }

        return NextResponse.json({ user }, { status: 201 });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
