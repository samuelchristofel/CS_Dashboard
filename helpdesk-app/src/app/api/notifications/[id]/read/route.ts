import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function isMissingNotificationTableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return (
    normalized.includes('notifications') &&
    (normalized.includes('does not exist') ||
      normalized.includes('table') ||
      normalized.includes('p2021') ||
      normalized.includes('p1014'))
  );
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = body.user_id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    try {
      const existing = await prisma.notification.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!existing) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return NextResponse.json({ notification: updated }, { status: 200 });
    } catch (error) {
      if (!isMissingNotificationTableError(error)) throw error;
      return NextResponse.json(
        {
          notification: {
            id,
            userId,
            isRead: true,
          },
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
