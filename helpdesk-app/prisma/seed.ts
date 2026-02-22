import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.note.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    console.log('👥 Creating users...');

    const admin = await prisma.user.create({
        data: {
            name: 'Samuel T. Owen',
            email: 'samuel@vastel.co.id',
            password: 'admin123',
            role: 'admin',
        }
    });

    const seniorDewi = await prisma.user.create({
        data: {
            name: 'Dewi Kartika',
            email: 'dewi@vastel.co.id',
            password: 'senior123',
            role: 'senior',
        }
    });

    const seniorReza = await prisma.user.create({
        data: {
            name: 'Reza Pratama',
            email: 'reza@vastel.co.id',
            password: 'senior123',
            role: 'senior',
        }
    });

    const juniorSiti = await prisma.user.create({
        data: {
            name: 'Siti Nurhaliza',
            email: 'siti@vastel.co.id',
            password: 'junior123',
            role: 'junior',
        }
    });

    const juniorAgus = await prisma.user.create({
        data: {
            name: 'Agus Setiawan',
            email: 'agus@vastel.co.id',
            password: 'junior123',
            role: 'junior',
        }
    });

    const juniorPutri = await prisma.user.create({
        data: {
            name: 'Putri Wulandari',
            email: 'putri@vastel.co.id',
            password: 'junior123',
            role: 'junior',
        }
    });

    const itBambang = await prisma.user.create({
        data: {
            name: 'Bambang Susilo',
            email: 'bambang@vastel.co.id',
            password: 'it123',
            role: 'it',
        }
    });

    const itEko = await prisma.user.create({
        data: {
            name: 'Eko Prasetyo',
            email: 'eko@vastel.co.id',
            password: 'it123',
            role: 'it',
        }
    });

    console.log(`✅ Created ${8} users`);

    // Create Tickets
    console.log('🎫 Creating tickets...');

    const ticket1 = await prisma.ticket.create({
        data: {
            number: '10001',
            subject: 'GPS tracker offline sejak kemarin malam',
            description: 'Unit GPS VT-200 pada truk B 1234 XYZ tidak mengirim sinyal sejak kemarin jam 23:00. Mohon dicek segera karena truk sedang dalam perjalanan ke Surabaya.',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            source: 'WhatsApp',
            customerName: 'PT. Sinar Jaya Logistics',
            customerEmail: 'operasional@sinarjaya.co.id',
            customerPhone: '0812-3456-7890',
            assignedToId: seniorDewi.id,
            createdById: juniorSiti.id,
            assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        }
    });

    const ticket2 = await prisma.ticket.create({
        data: {
            number: '10002',
            subject: 'Request instalasi GPS baru untuk 5 unit kendaraan',
            description: 'Ingin memasang GPS tracker untuk 5 unit armada baru. Mohon jadwalkan survei lokasi dan penawaran harga.',
            priority: 'MEDIUM',
            status: 'OPEN',
            source: 'Email',
            customerName: 'CV. Maju Bersama',
            customerEmail: 'fleet@majubersama.com',
            customerPhone: '0821-9876-5432',
            createdById: juniorAgus.id,
        }
    });

    const ticket3 = await prisma.ticket.create({
        data: {
            number: '10003',
            subject: 'Tidak bisa login ke dashboard tracking',
            description: 'Sejak update kemarin, saya tidak bisa login ke dashboard. Selalu muncul error "Invalid credentials" padahal password sudah benar.',
            priority: 'HIGH',
            status: 'WITH_IT',
            source: 'Freshchat',
            customerName: 'PT. Ekspedisi Nusantara',
            customerEmail: 'support@ekspedisi.co.id',
            customerPhone: '0813-5555-1234',
            assignedToId: itBambang.id,
            createdById: seniorReza.id,
            assignedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        }
    });

    const ticket4 = await prisma.ticket.create({
        data: {
            number: '10004',
            subject: 'Laporan posisi GPS tidak akurat',
            description: 'Posisi kendaraan yang ditampilkan di dashboard berbeda dengan lokasi sebenarnya. Selisihnya bisa sampai 500 meter.',
            priority: 'MEDIUM',
            status: 'PENDING_REVIEW',
            source: 'Phone',
            customerName: 'PT. Transportasi Prima',
            customerEmail: 'ops@transportasiprima.id',
            customerPhone: '0878-1234-5678',
            assignedToId: juniorPutri.id,
            createdById: seniorDewi.id,
            assignedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            closedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        }
    });

    const ticket5 = await prisma.ticket.create({
        data: {
            number: '10005',
            subject: 'Perpanjangan kontrak layanan GPS',
            description: 'Kontrak layanan GPS akan habis bulan depan. Mohon dikirimkan penawaran untuk perpanjangan 1 tahun.',
            priority: 'LOW',
            status: 'RESOLVED',
            source: 'Email',
            customerName: 'PT. Angkutan Sejahtera',
            customerEmail: 'admin@angkutansejahtera.com',
            assignedToId: juniorAgus.id,
            createdById: juniorSiti.id,
            assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            closedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        }
    });

    const ticket6 = await prisma.ticket.create({
        data: {
            number: '10006',
            subject: 'Alarm SOS tidak berfungsi',
            description: 'Tombol SOS pada unit GPS tidak mengirim notifikasi ke dashboard. Sudah dicoba berkali-kali tapi tidak ada alert masuk.',
            priority: 'HIGH',
            status: 'OPEN',
            source: 'WhatsApp',
            customerName: 'PT. Keamanan Armada',
            customerEmail: 'security@keamananarmada.id',
            customerPhone: '0856-9999-8888',
            createdById: juniorPutri.id,
        }
    });

    console.log(`✅ Created ${6} tickets`);

    // Create Activities
    console.log('📋 Creating activities...');

    await prisma.activity.createMany({
        data: [
            {
                action: 'TICKET_CREATED',
                details: 'Ticket #10001 created',
                userId: juniorSiti.id,
                ticketId: ticket1.id,
            },
            {
                action: 'TICKET_ASSIGNED',
                details: 'Ticket #10001 assigned to Dewi Kartika',
                userId: seniorDewi.id,
                ticketId: ticket1.id,
            },
            {
                action: 'TICKET_CREATED',
                details: 'Ticket #10002 created',
                userId: juniorAgus.id,
                ticketId: ticket2.id,
            },
            {
                action: 'TICKET_ESCALATED',
                details: 'Ticket #10003 escalated to IT Support',
                userId: seniorReza.id,
                ticketId: ticket3.id,
            },
            {
                action: 'TICKET_RESOLVED',
                details: 'Ticket #10005 resolved',
                userId: juniorAgus.id,
                ticketId: ticket5.id,
            },
        ]
    });

    console.log(`✅ Created 5 activities`);

    // Create Notes
    console.log('📝 Creating notes...');

    await prisma.note.create({
        data: {
            content: JSON.stringify({
                title: 'Initial Investigation',
                content: 'Checked GPS unit status - last signal received at 23:15. Possible causes: signal obstruction or device malfunction.',
                checklist_items: [
                    { text: 'Check device power status', completed: true },
                    { text: 'Verify SIM card balance', completed: true },
                    { text: 'Check antenna connection', completed: false },
                ]
            }),
            userId: seniorDewi.id,
            ticketId: ticket1.id,
        }
    });

    await prisma.note.create({
        data: {
            content: JSON.stringify({
                title: 'Customer Follow-up',
                content: 'Called customer at 10:00. They confirmed the truck arrived in Surabaya safely. Will check GPS unit on arrival.',
                checklist_items: []
            }),
            userId: seniorDewi.id,
            ticketId: ticket1.id,
        }
    });

    console.log(`✅ Created 2 notes`);

    console.log('');
    console.log('🎉 Seed completed successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('─────────────────────');
    console.log('Admin:  samuel@vastel.co.id / admin123');
    console.log('Senior: dewi@vastel.co.id / senior123');
    console.log('Senior: reza@vastel.co.id / senior123');
    console.log('Junior: siti@vastel.co.id / junior123');
    console.log('Junior: agus@vastel.co.id / junior123');
    console.log('Junior: putri@vastel.co.id / junior123');
    console.log('IT:     bambang@vastel.co.id / it123');
    console.log('IT:     eko@vastel.co.id / it123');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seed error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
