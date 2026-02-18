import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/chat/messages - Get messages for a conversation
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversation_id');
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!conversationId) {
            return NextResponse.json(
                { error: 'conversation_id is required' },
                { status: 400 }
            );
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: { id: true, name: true, email: true, role: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Chat messages API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/chat/messages - Send a message
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { conversation_id, sender_id, content, type = 'text' } = body;

        if (!conversation_id || !sender_id || !content) {
            return NextResponse.json(
                { error: 'conversation_id, sender_id, and content are required' },
                { status: 400 }
            );
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                conversationId: conversation_id,
                senderId: sender_id,
                content,
                type: type as 'text' | 'image' | 'file',
            },
            include: {
                sender: {
                    select: { id: true, name: true, email: true, role: true, avatar: true }
                }
            }
        });

        // Update conversation's last message
        await prisma.conversation.update({
            where: { id: conversation_id },
            data: {
                lastMessage: content.substring(0, 100),
                lastMessageAt: new Date(),
            }
        });

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
