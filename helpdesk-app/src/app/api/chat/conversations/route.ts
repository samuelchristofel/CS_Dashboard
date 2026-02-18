import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/chat/conversations - Get user's conversations with last messages
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            );
        }

        // Get all conversations for this user
        const participations = await prisma.conversationParticipant.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        participants: {
                            include: {
                                user: {
                                    select: { id: true, name: true, email: true, role: true, avatar: true }
                                }
                            }
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        }
                    }
                }
            }
        });

        // Transform to a more usable format
        const conversations = participations.map(p => {
            const otherParticipants = p.conversation.participants
                .filter(part => part.userId !== userId)
                .map(part => part.user);

            const lastMessage = p.conversation.messages[0];

            return {
                id: p.conversation.id,
                type: p.conversation.type,
                name: p.conversation.name,
                participants: otherParticipants,
                lastMessage: lastMessage?.content || null,
                lastMessageAt: lastMessage?.createdAt || null,
                lastReadAt: p.lastReadAt,
            };
        });

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error('Chat conversations API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/chat/conversations - Create a new conversation
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user_id, participant_ids, type = 'direct', name } = body;

        if (!user_id || !participant_ids || !Array.isArray(participant_ids)) {
            return NextResponse.json(
                { error: 'user_id and participant_ids are required' },
                { status: 400 }
            );
        }

        // Check if direct conversation already exists between these users
        if (type === 'direct' && participant_ids.length === 1) {
            const existingConvo = await prisma.conversation.findFirst({
                where: {
                    type: 'direct',
                    AND: [
                        { participants: { some: { userId: user_id } } },
                        { participants: { some: { userId: participant_ids[0] } } },
                    ]
                },
                include: {
                    participants: {
                        include: {
                            user: { select: { id: true, name: true, email: true, role: true, avatar: true } }
                        }
                    }
                }
            });

            if (existingConvo) {
                return NextResponse.json({ conversation: existingConvo });
            }
        }

        // Create new conversation
        const conversation = await prisma.conversation.create({
            data: {
                type: type as 'direct' | 'group',
                name: name || null,
                participants: {
                    create: [
                        { userId: user_id },
                        ...participant_ids.map((id: string) => ({ userId: id }))
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true, email: true, role: true, avatar: true } }
                    }
                }
            }
        });

        return NextResponse.json({ conversation }, { status: 201 });
    } catch (error) {
        console.error('Create conversation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
