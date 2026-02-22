import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

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

export async function PATCH(request: Request) {
  try {
    let userId: string | undefined;
    try {
      const body = await request.json();
      userId = body.user_id as string | undefined;
    } catch {
      userId = undefined;
    }
    if (!userId) {
      const { searchParams } = new URL(request.url);
      userId = searchParams.get('user_id') || request.headers.get('x-user-id') || undefined;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const result = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      return NextResponse.json({ updated: result.count }, { status: 200 });
    } catch (error) {
      if (!isMissingNotificationTableError(error)) throw error;
      return NextResponse.json({ updated: 0 }, { status: 200 });
    }
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
