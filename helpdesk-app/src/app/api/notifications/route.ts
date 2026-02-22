import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ensureOverdueNotificationsForUser } from '@/lib/notifications';

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
    const userId = searchParams.get('user_id') || request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    await ensureOverdueNotificationsForUser(userId);
    let notifications: any[] = [];
    let unreadCount = 0;
    try {
      notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { ticket: true },
      });

      unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      });
    } catch (error) {
      if (!isMissingNotificationTableError(error)) throw error;
      notifications = [];
      unreadCount = 0;
    }

    console.log(`[notifications:get] user=${userId} total=${notifications.length} unread=${unreadCount}`);

    const transformed = notifications.map((n) => ({
      id: n.id,
      user_id: n.userId,
      type: n.type,
      title: n.title,
      description: n.description,
      ticket_id: n.ticketId,
      is_read: n.isRead,
      created_at: n.createdAt.toISOString(),
      ticket: n.ticket
        ? {
            id: n.ticket.id,
            number: n.ticket.number,
            subject: n.ticket.subject,
            status: n.ticket.status,
            priority: n.ticket.priority,
            source: n.ticket.source,
            customer_name: n.ticket.customerName,
          }
        : null,
    }));

    return NextResponse.json({ notifications: transformed, unread_count: unreadCount });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
