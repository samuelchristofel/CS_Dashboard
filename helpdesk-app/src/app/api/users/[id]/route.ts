import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/users/[id] - Get single user
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, role, avatar, created_at')
            .eq('id', id)
            .single();

        if (error || !user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });

    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, email, password, role, avatar } = body;

        // Build update object
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (password) updates.password = password;
        if (role) updates.role = role;
        if (avatar !== undefined) updates.avatar = avatar;

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', id)
            .select('id, name, email, role, avatar, created_at')
            .single();

        if (error) {
            console.error('Error updating user:', error);
            return NextResponse.json(
                { error: 'Failed to update user' },
                { status: 500 }
            );
        }

        return NextResponse.json({ user });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting user:', error);
            return NextResponse.json(
                { error: 'Failed to delete user' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'User deleted' });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
