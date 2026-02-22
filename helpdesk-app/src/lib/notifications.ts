import prisma from '@/lib/db';

interface BaseNotificationInput {
  type: string;
  title: string;
  description: string;
  ticketId?: string | null;
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

async function createForUsers(userIds: string[], input: BaseNotificationInput) {
  const dedupedUserIds = [...new Set(userIds.filter(Boolean))];
  if (dedupedUserIds.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: dedupedUserIds.map((userId) => ({
        userId,
        type: input.type,
        title: input.title,
        description: input.description,
        ticketId: input.ticketId || null,
        isRead: false,
      })),
    });
  } catch (error) {
    if (isMissingNotificationTableError(error)) return;
    throw error;
  }
}

export async function notifyNewTicketCreated(ticket: {
  id: string;
  number: string;
  subject: string;
  customerName: string;
}) {
  const recipients = await prisma.user.findMany({
    where: { role: { in: ['senior', 'junior', 'admin'] } },
    select: { id: true },
  });

  await createForUsers(
    recipients.map((u) => u.id),
    {
      type: 'new_ticket',
      title: 'Tiket Baru Masuk',
      description: `${ticket.subject} · ${ticket.customerName}`,
      ticketId: ticket.id,
    },
  );
}

export async function notifyTicketAssigned(ticket: {
  id: string;
  number: string;
  subject: string;
  assignedToId?: string | null;
}) {
  if (!ticket.assignedToId) return;

  await createForUsers([ticket.assignedToId], {
    type: 'assigned',
    title: `Tiket #${ticket.number} Ditugaskan`,
    description: ticket.subject,
    ticketId: ticket.id,
  });
}

export async function notifyTicketEscalated(ticket: {
  id: string;
  number: string;
  subject: string;
}) {
  const recipients = await prisma.user.findMany({
    where: { role: { in: ['it', 'admin'] } },
    select: { id: true },
  });

  await createForUsers(
    recipients.map((u) => u.id),
    {
      type: 'escalated',
      title: `Tiket #${ticket.number} Diekalasi ke IT`,
      description: ticket.subject,
      ticketId: ticket.id,
    },
  );
}

export async function notifyTicketResolved(ticket: {
  id: string;
  number: string;
  subject: string;
  assignedToId?: string | null;
}) {
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true },
  });
  const recipients = [...admins.map((u) => u.id), ticket.assignedToId || ''];

  await createForUsers(recipients, {
    type: 'resolved',
    title: `Tiket #${ticket.number} Diselesaikan`,
    description: ticket.subject,
    ticketId: ticket.id,
  });
}

export async function notifyTicketFixed(ticket: {
  id: string;
  number: string;
  subject: string;
  createdById?: string | null;
}) {
  if (!ticket.createdById) return;

  await createForUsers([ticket.createdById], {
    type: 'fixed',
    title: `Tiket #${ticket.number} Ditandai Fixed oleh IT`,
    description: ticket.subject,
    ticketId: ticket.id,
  });
}

export async function notifyNoteAdded(ticket: {
  id: string;
  number: string;
  subject: string;
  assignedToId?: string | null;
}, authorId?: string) {
  if (!ticket.assignedToId || ticket.assignedToId === authorId) return;

  await createForUsers([ticket.assignedToId], {
    type: 'note_added',
    title: `Catatan Baru di Tiket #${ticket.number}`,
    description: ticket.subject,
    ticketId: ticket.id,
  });
}

export async function ensureOverdueNotificationsForUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) return;

    const now = new Date();
    const staleThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const overdueTickets = await prisma.ticket.findMany({
      where: {
        updatedAt: { lt: staleThreshold },
        status: { notIn: ['RESOLVED', 'CLOSED'] },
        OR: user.role === 'admin' ? [{ assignedToId: { not: null } }] : [{ assignedToId: userId }],
      },
      select: {
        id: true,
        number: true,
        subject: true,
        assignedToId: true,
      },
    });

    for (const ticket of overdueTickets) {
      const shouldNotify =
        user.role === 'admin' || ticket.assignedToId === user.id;
      if (!shouldNotify) continue;

      const exists = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          type: 'overdue',
          ticketId: ticket.id,
        },
        select: { id: true },
      });
      if (exists) continue;

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'overdue',
          title: `Tiket #${ticket.number} Melebihi SLA`,
          description: ticket.subject,
          ticketId: ticket.id,
          isRead: false,
        },
      });
    }
  } catch (error) {
    if (isMissingNotificationTableError(error)) return;
    throw error;
  }
}
