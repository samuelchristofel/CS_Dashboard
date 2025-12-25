// Simple seed script for Prisma 7
// Run with: node --loader tsx prisma/seed.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Users
    const jayWon = await prisma.user.upsert({
        where: { email: 'jay@helpdesk.com' },
        update: {},
        create: {
            name: 'Jay Won',
            email: 'jay@helpdesk.com',
            password: 'senior123',
            role: 'senior',
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

    console.log('✅ Users:', jayWon.name, himari.name, budi.name, admin.name);

    // Create Tickets
    await prisma.ticket.upsert({
        where: { number: '8821' },
        update: {},
        create: {
            number: '8821',
            subject: 'GPS device offline for 3 hours',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            customerName: 'PT. Trans Logistics',
            assignedToId: jayWon.id,
        },
    });

    await prisma.ticket.upsert({
        where: { number: '8820' },
        update: {},
        create: {
            number: '8820',
            subject: 'Invoice discrepancy for November',
            priority: 'MEDIUM',
            status: 'PENDING_REVIEW',
            customerName: 'CV. Maju Bersama',
            assignedToId: himari.id,
        },
    });

    await prisma.ticket.upsert({
        where: { number: '8819' },
        update: {},
        create: {
            number: '8819',
            subject: 'Server authentication error 500',
            priority: 'HIGH',
            status: 'WITH_IT',
            customerName: 'PT. Digital Solusi',
            assignedToId: budi.id,
        },
    });

    await prisma.ticket.upsert({
        where: { number: '8818' },
        update: {},
        create: {
            number: '8818',
            subject: 'Request for fleet pricing',
            priority: 'LOW',
            status: 'OPEN',
            customerName: 'Sarah Williams',
        },
    });

    console.log('✅ Tickets created!');
    console.log('🎉 Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
