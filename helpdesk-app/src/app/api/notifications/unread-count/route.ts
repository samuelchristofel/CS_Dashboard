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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    try {
      const count = await prisma.notification.count({
        where: { userId, isRead: false },
      });
      return NextResponse.json({ count }, { status: 200 });
    } catch (error) {
      if (!isMissingNotificationTableError(error)) throw error;
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
  } catch (error) {
    console.error('Unread notifications count error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
