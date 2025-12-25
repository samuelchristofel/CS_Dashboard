import { PrismaClient } from '@prisma/client';

// Create a new instance for seeding
const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || 'file:./dev.db',
});

async function main() {
    console.log('🌱 Seeding database...');

    // Create Users
    const jayWon = await prisma.user.upsert({
        where: { email: 'jay@helpdesk.com' },
        update: {},
        create: {
            name: 'Jay Won',
            email: 'jay@helpdesk.com',
            password: 'senior123', // In production, this should be hashed
            role: 'senior',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoS1f1jqiPLCv9wP1ZX5ODYa0ghkKGjzT0pHb0bhhH20OWJucjJF3IaQ3_s7kGdgzSrESvLELeRePVCXvRr6Yy6B44ot4XYOMJ8EMZqG-XCW3_LdyPn99i7jvXqfWcPrKLwpHBNINwHk8ii2yZhCVjb4ie45MSAzkKY1ThrKQqU6IW1IYNMpiJCMbLekMBKotxWueVnTbLJwOjHjthhnsBYumDmvRUF1jRAc8enpPdmTnLWmqaUL-YtKY7AbgW3bg6V9BjT3ZcykA',
        },
    });

    const himari = await prisma.user.upsert({
        where: { email: 'himari@helpdesk.com' },
        update: {},
        create: {
            name: 'Himari',
            email: 'himari@helpdesk.com',
            password: 'junior123',
            role: 'junior',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN0rsqgI4Fv1zrp1NtwFDfMAtVMQ2Oy1GVDJOvJ6nCUCQ7jsiVV56xA7nbgCm5tdWoz7uRJrvKLjNMVQjnTMrOkljsYHrZQXhnMHQ5CdvP5axphgV6bpBS37A56yKKtC62X_dV8ExJ__FV1vSZxJHnm6MtQpfaAfapPm0coFGD-DUok5mewrK8Mmy6ABuxS5_YsFmQs1t22lop8_n8TY7Vk9QXC4c9Gu2AMIHn2KB-a37kNDLDGLObRehy6a9NVQSgv140p_nRAM8',
        },
    });

    const budi = await prisma.user.upsert({
        where: { email: 'budi@helpdesk.com' },
        update: {},
        create: {
            name: 'Budi Santoso',
            email: 'budi@helpdesk.com',
            password: 'it123',
            role: 'it',
        },
    });

    const admin = await prisma.user.upsert({
        where: { email: 'admin@helpdesk.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@helpdesk.com',
            password: 'admin123',
            role: 'admin',
        },
    });

    console.log('✅ Users created:', { jayWon: jayWon.id, himari: himari.id, budi: budi.id, admin: admin.id });

    // Create Tickets
    const ticket1 = await prisma.ticket.upsert({
        where: { number: '8821' },
        update: {},
        create: {
            number: '8821',
            subject: 'GPS device offline for 3 hours',
            description: 'Customer reports that their GPS tracker has been offline since 10 AM.',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            source: 'Freshchat',
            customerName: 'PT. Trans Logistics',
            customerPhone: '0812****1234',
            assignedToId: jayWon.id,
        },
    });

    const ticket2 = await prisma.ticket.upsert({
        where: { number: '8820' },
        update: {},
        create: {
            number: '8820',
            subject: 'Invoice discrepancy for November',
            description: 'Questions about invoice charges from last month.',
            priority: 'MEDIUM',
            status: 'PENDING_REVIEW',
            source: 'WhatsApp',
            customerName: 'CV. Maju Bersama',
            customerPhone: '0821****5678',
            assignedToId: himari.id,
        },
    });

    const ticket3 = await prisma.ticket.upsert({
        where: { number: '8819' },
        update: {},
        create: {
            number: '8819',
            subject: 'Server authentication error 500',
            description: 'JWT token expiry issue - backend API.',
            priority: 'HIGH',
            status: 'WITH_IT',
            source: 'Freshchat',
            customerName: 'PT. Digital Solusi',
            customerPhone: '0815****9012',
            assignedToId: budi.id,
        },
    });

    const ticket4 = await prisma.ticket.upsert({
        where: { number: '8818' },
        update: {},
        create: {
            number: '8818',
            subject: 'Request for fleet pricing quotation',
            description: 'Potential new customer asking for pricing.',
            priority: 'LOW',
            status: 'OPEN',
            source: 'WhatsApp',
            customerName: 'Sarah Williams',
            customerPhone: '0856****3456',
        },
    });

    const ticket5 = await prisma.ticket.upsert({
        where: { number: '8817' },
        update: {},
        create: {
            number: '8817',
            subject: 'Password reset request',
            description: 'Need help resetting account password.',
            priority: 'LOW',
            status: 'CLOSED',
            source: 'Freshchat',
            customerName: 'Ahmad Fauzi',
            customerPhone: '0877****7890',
            assignedToId: himari.id,
            closedAt: new Date(),
        },
    });

    console.log('✅ Tickets created:', {
        ticket1: ticket1.number,
        ticket2: ticket2.number,
        ticket3: ticket3.number,
        ticket4: ticket4.number,
        ticket5: ticket5.number
    });

    // Create some activity logs
    await prisma.activity.createMany({
        data: [
            {
                action: 'CREATED',
                details: 'Ticket created from Freshchat',
                userId: jayWon.id,
                ticketId: ticket1.id,
            },
            {
                action: 'ASSIGNED',
                details: 'Assigned to Jay Won',
                userId: jayWon.id,
                ticketId: ticket1.id,
            },
            {
                action: 'ESCALATED',
                details: 'Escalated to IT Support',
                userId: jayWon.id,
                ticketId: ticket3.id,
            },
            {
                action: 'CLOSED',
                details: 'Ticket resolved and closed',
                userId: himari.id,
                ticketId: ticket5.id,
            },
        ],
    });

    console.log('✅ Activities created');

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
