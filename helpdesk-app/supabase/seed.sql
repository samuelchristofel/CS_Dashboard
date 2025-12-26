-- =============================================
-- VASTEL HELPDESK SEED DATA
-- GPS Tracking & Fleet Management System
-- Run this AFTER schema.sql
-- =============================================

-- Clear existing data first
TRUNCATE users, tickets, notes, activities CASCADE;

-- =============================================
-- INSERT VASTEL CS TEAM USERS
-- =============================================

INSERT INTO users (name, email, password, role, avatar) VALUES
-- Senior CS Agents
('Dewi Kartika', 'dewi@vastel.co.id', 'senior123', 'senior', NULL),
('Reza Pratama', 'reza@vastel.co.id', 'senior123', 'senior', NULL),

-- Junior CS Agents  
('Siti Nurhaliza', 'siti@vastel.co.id', 'junior123', 'junior', NULL),
('Agus Setiawan', 'agus@vastel.co.id', 'junior123', 'junior', NULL),
('Putri Wulandari', 'putri@vastel.co.id', 'junior123', 'junior', NULL),

-- IT Support
('Bambang Susilo', 'bambang@vastel.co.id', 'it123', 'it', NULL),
('Eko Prasetyo', 'eko@vastel.co.id', 'it123', 'it', NULL),

-- Admin
('Samuel T. Owen', 'samuel@vastel.co.id', 'admin123', 'admin', NULL)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- INSERT DEMO TICKETS
-- Various dates from November - December 2024
-- =============================================

DO $$
DECLARE
    dewi_id UUID;
    reza_id UUID;
    siti_id UUID;
    agus_id UUID;
    putri_id UUID;
    bambang_id UUID;
    eko_id UUID;
    samuel_id UUID;
BEGIN
    SELECT id INTO dewi_id FROM users WHERE email = 'dewi@vastel.co.id';
    SELECT id INTO reza_id FROM users WHERE email = 'reza@vastel.co.id';
    SELECT id INTO siti_id FROM users WHERE email = 'siti@vastel.co.id';
    SELECT id INTO agus_id FROM users WHERE email = 'agus@vastel.co.id';
    SELECT id INTO putri_id FROM users WHERE email = 'putri@vastel.co.id';
    SELECT id INTO bambang_id FROM users WHERE email = 'bambang@vastel.co.id';
    SELECT id INTO eko_id FROM users WHERE email = 'eko@vastel.co.id';
    SELECT id INTO samuel_id FROM users WHERE email = 'samuel@vastel.co.id';

    -- =============================================
    -- ACTIVE TICKETS (OPEN, IN_PROGRESS, WITH_IT, PENDING_REVIEW)
    -- =============================================

    -- Ticket 1: HIGH - GPS offline (IN_PROGRESS - Senior)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10001',
        'GPS tracker offline sejak kemarin malam',
        'Unit GPS VT-200 pada truk B 1234 XYZ tidak mengirim sinyal sejak pukul 22:00 WIB kemarin. Pelanggan membutuhkan bantuan urgent karena truk sedang dalam perjalanan pengiriman barang.',
        'HIGH',
        'IN_PROGRESS',
        'WhatsApp',
        'PT. Sinar Jaya Logistics',
        'operasional@sinarjaya.co.id',
        '0812-3456-7890',
        dewi_id,
        dewi_id,
        NOW() - INTERVAL '4 hours'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 2: HIGH - Dashboard Orin error 500 (WITH_IT)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10002',
        'Dashboard Orin error 500 saat akses history',
        'Pelanggan tidak bisa mengakses fitur history tracking di dashboard Orin. Muncul error 500 Internal Server Error. Issue terjadi sejak pagi ini.',
        'HIGH',
        'WITH_IT',
        'Freshchat',
        'CV. Mitra Angkutan',
        'admin@mitraangkutan.com',
        '0821-9876-5432',
        bambang_id,
        reza_id,
        NOW() - INTERVAL '6 hours'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 3: MEDIUM - Invoice discrepancy (PENDING_REVIEW)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10003',
        'Selisih tagihan bulan November 2024',
        'Pelanggan melaporkan ada selisih Rp 450.000 pada invoice bulan November. Mereka klaim hanya mengaktifkan 25 unit GPS, bukan 28 unit seperti di tagihan.',
        'MEDIUM',
        'PENDING_REVIEW',
        'Email',
        'PT. Armada Nusantara',
        'finance@armadanusantara.co.id',
        '0857-2345-6789',
        siti_id,
        dewi_id,
        NOW() - INTERVAL '1 day'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 4: LOW - Request quotation (OPEN - Unassigned)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10004',
        'Permintaan penawaran 100 unit GPS untuk fleet baru',
        'Perusahaan baru ingin memasang GPS tracker untuk 100 unit truk dan 50 unit motor kurir. Minta dikirimkan penawaran harga enterprise beserta fitur Zend dan Fieldmate.',
        'LOW',
        'OPEN',
        'Email',
        'PT. Cepat Kirim Indonesia',
        'procurement@cepatkirim.id',
        '0815-8765-4321',
        NULL,
        samuel_id,
        NOW() - INTERVAL '2 hours'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 5: MEDIUM - Zend app crash (IN_PROGRESS - Junior)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10005',
        'Aplikasi Zend crash saat assign task ke driver',
        'Supervisor logistik tidak bisa assign task ke driver melalui aplikasi Zend. App force close setiap kali klik tombol "Assign". Sudah coba reinstall tapi masih sama.',
        'MEDIUM',
        'IN_PROGRESS',
        'WhatsApp',
        'PT. Hasta Karya Mandiri',
        'logistik@hastakarya.com',
        '0878-1234-5678',
        agus_id,
        reza_id,
        NOW() - INTERVAL '3 hours'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 6: HIGH - Geofence alert tidak jalan (IN_PROGRESS - Senior)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10006',
        'Notifikasi geofence tidak terkirim',
        'Alert geofence untuk area gudang tidak terkirim ke email maupun WhatsApp. Kendaraan sudah keluar-masuk area berkali-kali tapi tidak ada notifikasi sama sekali.',
        'HIGH',
        'IN_PROGRESS',
        'Freshchat',
        'PT. Global Trans Sejahtera',
        'fleet@globaltrans.co.id',
        '0811-2233-4455',
        reza_id,
        reza_id,
        NOW() - INTERVAL '5 hours'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 7: LOW - Password reset (IN_PROGRESS - Junior)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10007',
        'Lupa password akun dashboard Orin',
        'User baru dari tim operasional tidak bisa login ke dashboard. Belum pernah set password dan link aktivasi sudah expired.',
        'LOW',
        'IN_PROGRESS',
        'WhatsApp',
        'CV. Berkah Jaya Transport',
        'hrd@berkahjaya.com',
        '0856-7890-1234',
        putri_id,
        dewi_id,
        NOW() - INTERVAL '30 minutes'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 8: MEDIUM - Map display wrong location (WITH_IT)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10008',
        'Lokasi kendaraan di peta tidak akurat',
        'Posisi truk di dashboard menunjukkan lokasi yang berbeda 2-3 km dari lokasi sebenarnya. Driver sudah konfirmasi posisi real via telepon.',
        'MEDIUM',
        'WITH_IT',
        'Freshchat',
        'PT. Rajawali Express',
        'control@rajawaliexpress.co.id',
        '0813-5678-9012',
        eko_id,
        dewi_id,
        NOW() - INTERVAL '8 hours'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 9: HIGH - Integration Kemenhub error (WITH_IT)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10009',
        'Data kendaraan tidak muncul di dashboard Kemenhub',
        'Armada bus antar-kota tidak terdaftar di sistem Kemenhub padahal GPS sudah aktif. Ini urgent karena ada razia besok dan wajib terdaftar.',
        'HIGH',
        'WITH_IT',
        'WhatsApp',
        'PO. Putra Mulya',
        'admin@putramulya.co.id',
        '0822-9988-7766',
        bambang_id,
        reza_id,
        NOW() - INTERVAL '2 hours'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 10: LOW - Feature request (OPEN)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10010',
        'Request fitur export laporan ke Excel',
        'Pelanggan meminta fitur export data history tracking ke format Excel untuk keperluan laporan bulanan ke manajemen.',
        'LOW',
        'OPEN',
        'Email',
        'PT. Lintas Samudra Shipping',
        'it@lintassamudra.com',
        '0817-6543-2109',
        NULL,
        samuel_id,
        NOW() - INTERVAL '12 hours'
    ) ON CONFLICT (number) DO NOTHING;

    -- =============================================
    -- CLOSED/RESOLVED TICKETS (Past dates)
    -- =============================================

    -- Ticket 11: CLOSED - GPS installation (2 days ago)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, closed_at)
    VALUES (
        '9995',
        'Request jadwal pemasangan GPS 10 unit',
        'Pelanggan baru ingin menjadwalkan pemasangan GPS untuk 10 unit pickup di area Bekasi.',
        'MEDIUM',
        'CLOSED',
        'WhatsApp',
        'PT. Karya Utama Sejahtera',
        'fleet@karyautama.com',
        '0812-1111-2222',
        dewi_id,
        dewi_id,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '2 days'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 12: CLOSED - Billing issue (3 days ago)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, closed_at)
    VALUES (
        '9994',
        'Pembayaran sudah transfer tapi status masih unpaid',
        'Pelanggan sudah transfer pembayaran invoice tanggal 20 November tapi status di sistem masih unpaid.',
        'MEDIUM',
        'CLOSED',
        'Email',
        'CV. Sentosa Abadi',
        'keuangan@sentosaabadi.co.id',
        '0857-3333-4444',
        siti_id,
        siti_id,
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '3 days'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 13: CLOSED - Device replacement (5 days ago)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, closed_at)
    VALUES (
        '9993',
        'GPS unit rusak karena korsleting aki',
        'Unit VT-100 terbakar karena korsleting aki di truk pelanggan. Minta proses klaim garansi dan penggantian unit.',
        'HIGH',
        'CLOSED',
        'WhatsApp',
        'PT. Buana Sakti Logistik',
        'maintenance@buanasakti.co.id',
        '0821-5555-6666',
        reza_id,
        reza_id,
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '5 days'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 14: CLOSED - App login issue (1 week ago)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, closed_at)
    VALUES (
        '9992',
        'Tidak bisa login ke aplikasi Fieldmate',
        'Sales agent tidak bisa masuk ke aplikasi Fieldmate setelah update versi terbaru. Token expired.',
        'MEDIUM',
        'CLOSED',
        'Freshchat',
        'PT. Mega Distribusi Nasional',
        'sales@megadistribusi.com',
        '0815-7777-8888',
        bambang_id,
        agus_id,
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '7 days'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 15: CLOSED - Speed alert config (2 weeks ago)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, closed_at)
    VALUES (
        '9991',
        'Setting alert kecepatan di atas 80 km/jam',
        'Pelanggan minta diaktifkan notifikasi jika kendaraan melaju lebih dari 80 km/jam untuk alasan safety.',
        'LOW',
        'CLOSED',
        'Email',
        'PT. Prima Andalan Cargo',
        'safety@primacargo.co.id',
        '0878-9999-0000',
        putri_id,
        dewi_id,
        NOW() - INTERVAL '16 days',
        NOW() - INTERVAL '14 days'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 16: CLOSED - Account upgrade (3 weeks ago)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, closed_at)
    VALUES (
        '9990',
        'Upgrade paket dari Basic ke Enterprise',
        'Request upgrade paket langganan dari Basic ke Enterprise untuk mendapatkan fitur API integration dan unlimited history.',
        'LOW',
        'CLOSED',
        'Email',
        'PT. Anugerah Makmur Indonesia',
        'purchasing@anugerahmakmur.co.id',
        '0811-1234-5678',
        siti_id,
        samuel_id,
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '21 days'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 17: CLOSED - Multiple device offline (1 month ago)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, closed_at)
    VALUES (
        '9985',
        '15 unit GPS offline bersamaan',
        'Semua GPS di area Surabaya offline secara bersamaan. Diduga ada masalah jaringan operator atau server regional.',
        'HIGH',
        'CLOSED',
        'WhatsApp',
        'PT. Jaya Makmur Transport',
        'it@jayamakmur.co.id',
        '0822-2345-6789',
        eko_id,
        reza_id,
        NOW() - INTERVAL '35 days',
        NOW() - INTERVAL '30 days'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 18: CLOSED - Training request (1 month ago)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, closed_at)
    VALUES (
        '9984',
        'Request training penggunaan dashboard Orin',
        'Tim operasional baru bergabung dan butuh training penggunaan fitur-fitur dashboard Orin untuk 5 orang.',
        'LOW',
        'CLOSED',
        'Email',
        'PT. Sumber Rezeki Abadi',
        'training@sumberrezeki.co.id',
        '0813-8765-4321',
        agus_id,
        dewi_id,
        NOW() - INTERVAL '40 days',
        NOW() - INTERVAL '35 days'
    ) ON CONFLICT (number) DO NOTHING;

    -- Additional open tickets for variety
    -- Ticket 19: MEDIUM - Fieldmate sync issue (OPEN)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10011',
        'Data Fieldmate tidak sync dengan dashboard',
        'Check-in dan check-out dari field agent tidak muncul di dashboard meskipun status di app menunjukkan berhasil.',
        'MEDIUM',
        'OPEN',
        'Freshchat',
        'PT. Sukses Bersama Jaya',
        'ops@suksesbersama.com',
        '0856-1122-3344',
        NULL,
        reza_id,
        NOW() - INTERVAL '1 hour'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 20: HIGH - Engine shutdown not working (IN_PROGRESS)
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at)
    VALUES (
        '10012',
        'Fitur engine shutdown GPS tidak berfungsi',
        'Perintah shutdown dari dashboard tidak dieksekusi oleh GPS unit. Urgent karena ada kendaraan dicurigai dibawa kabur oleh driver.',
        'HIGH',
        'IN_PROGRESS',
        'WhatsApp',
        'PT. Andalan Prima Logistik',
        'security@andalanprima.co.id',
        '0817-5566-7788',
        dewi_id,
        dewi_id,
        NOW() - INTERVAL '45 minutes'
    ) ON CONFLICT (number) DO NOTHING;

END $$;

-- =============================================
-- INSERT ACTIVITY LOGS
-- =============================================

DO $$
DECLARE
    dewi_id UUID;
    reza_id UUID;
    siti_id UUID;
    agus_id UUID;
    putri_id UUID;
    bambang_id UUID;
    eko_id UUID;
    ticket_10001 UUID;
    ticket_10002 UUID;
    ticket_10003 UUID;
    ticket_10005 UUID;
    ticket_10006 UUID;
    ticket_10009 UUID;
    ticket_10012 UUID;
BEGIN
    SELECT id INTO dewi_id FROM users WHERE email = 'dewi@vastel.co.id';
    SELECT id INTO reza_id FROM users WHERE email = 'reza@vastel.co.id';
    SELECT id INTO siti_id FROM users WHERE email = 'siti@vastel.co.id';
    SELECT id INTO agus_id FROM users WHERE email = 'agus@vastel.co.id';
    SELECT id INTO putri_id FROM users WHERE email = 'putri@vastel.co.id';
    SELECT id INTO bambang_id FROM users WHERE email = 'bambang@vastel.co.id';
    SELECT id INTO eko_id FROM users WHERE email = 'eko@vastel.co.id';
    SELECT id INTO ticket_10001 FROM tickets WHERE number = '10001';
    SELECT id INTO ticket_10002 FROM tickets WHERE number = '10002';
    SELECT id INTO ticket_10003 FROM tickets WHERE number = '10003';
    SELECT id INTO ticket_10005 FROM tickets WHERE number = '10005';
    SELECT id INTO ticket_10006 FROM tickets WHERE number = '10006';
    SELECT id INTO ticket_10009 FROM tickets WHERE number = '10009';
    SELECT id INTO ticket_10012 FROM tickets WHERE number = '10012';

    -- Today's activities
    INSERT INTO activities (action, details, user_id, ticket_id, created_at)
    VALUES ('TICKET_CREATED', 'Tiket #10012 dibuat - Fitur engine shutdown tidak berfungsi', dewi_id, ticket_10012, NOW() - INTERVAL '45 minutes');

    INSERT INTO activities (action, details, user_id, ticket_id, created_at)
    VALUES ('TICKET_CREATED', 'Tiket #10001 dibuat - GPS tracker offline', dewi_id, ticket_10001, NOW() - INTERVAL '4 hours');

    INSERT INTO activities (action, details, user_id, ticket_id, created_at)
    VALUES ('TICKET_ESCALATED', 'Tiket #10002 dieskalasi ke IT Support', reza_id, ticket_10002, NOW() - INTERVAL '5 hours');

    INSERT INTO activities (action, details, user_id, ticket_id, created_at)
    VALUES ('TICKET_ESCALATED', 'Tiket #10009 dieskalasi ke IT - Issue integrasi Kemenhub', reza_id, ticket_10009, NOW() - INTERVAL '2 hours');

    INSERT INTO activities (action, details, user_id, ticket_id, created_at)
    VALUES ('TICKET_ASSIGNED', 'Tiket #10003 di-assign ke Siti Nurhaliza', dewi_id, ticket_10003, NOW() - INTERVAL '1 day');

    INSERT INTO activities (action, details, user_id, ticket_id, created_at)
    VALUES ('TICKET_ASSIGNED', 'Tiket #10005 di-assign ke Agus Setiawan', reza_id, ticket_10005, NOW() - INTERVAL '3 hours');

    INSERT INTO activities (action, details, user_id, ticket_id, created_at)
    VALUES ('NOTE_ADDED', 'Catatan ditambahkan pada tiket #10006', reza_id, ticket_10006, NOW() - INTERVAL '4 hours');

    -- User login activities
    INSERT INTO activities (action, details, user_id, created_at)
    VALUES ('USER_LOGIN', 'Dewi Kartika login ke sistem', dewi_id, NOW() - INTERVAL '8 hours');

    INSERT INTO activities (action, details, user_id, created_at)
    VALUES ('USER_LOGIN', 'Reza Pratama login ke sistem', reza_id, NOW() - INTERVAL '7 hours');

    INSERT INTO activities (action, details, user_id, created_at)
    VALUES ('USER_LOGIN', 'Bambang Susilo login ke sistem', bambang_id, NOW() - INTERVAL '6 hours');

END $$;

-- =============================================
-- INSERT SAMPLE NOTES
-- =============================================

DO $$
DECLARE
    dewi_id UUID;
    reza_id UUID;
    bambang_id UUID;
    eko_id UUID;
    ticket_10001 UUID;
    ticket_10002 UUID;
    ticket_10006 UUID;
    ticket_10008 UUID;
    ticket_10009 UUID;
    ticket_10012 UUID;
BEGIN
    SELECT id INTO dewi_id FROM users WHERE email = 'dewi@vastel.co.id';
    SELECT id INTO reza_id FROM users WHERE email = 'reza@vastel.co.id';
    SELECT id INTO bambang_id FROM users WHERE email = 'bambang@vastel.co.id';
    SELECT id INTO eko_id FROM users WHERE email = 'eko@vastel.co.id';
    SELECT id INTO ticket_10001 FROM tickets WHERE number = '10001';
    SELECT id INTO ticket_10002 FROM tickets WHERE number = '10002';
    SELECT id INTO ticket_10006 FROM tickets WHERE number = '10006';
    SELECT id INTO ticket_10008 FROM tickets WHERE number = '10008';
    SELECT id INTO ticket_10009 FROM tickets WHERE number = '10009';
    SELECT id INTO ticket_10012 FROM tickets WHERE number = '10012';

    -- Notes for ticket 10001 (GPS offline)
    INSERT INTO notes (content, user_id, ticket_id, created_at)
    VALUES ('Sudah hubungi pelanggan via WhatsApp. Driver konfirmasi truk sedang parkir di rest area KM 120 tol Jakarta-Cikampek.', dewi_id, ticket_10001, NOW() - INTERVAL '3 hours');

    INSERT INTO notes (content, user_id, ticket_id, created_at)
    VALUES ('Cek kondisi GPS, kemungkinan antena terlepas atau kabel power dicabut. Minta driver untuk foto kondisi unit GPS.', dewi_id, ticket_10001, NOW() - INTERVAL '2 hours');

    -- Notes for ticket 10002 (Dashboard error)
    INSERT INTO notes (content, user_id, ticket_id, created_at)
    VALUES ('Error 500 terjadi saat query ke database history. Log server menunjukkan timeout pada query tanggal tertentu.', bambang_id, ticket_10002, NOW() - INTERVAL '4 hours');

    -- Notes for ticket 10006 (Geofence alert)
    INSERT INTO notes (content, user_id, ticket_id, created_at)
    VALUES ('Sudah cek konfigurasi geofence. Polygon area sudah benar. Kemungkinan issue di notification service.', reza_id, ticket_10006, NOW() - INTERVAL '4 hours');

    -- Notes for ticket 10008 (Location inaccurate)
    INSERT INTO notes (content, user_id, ticket_id, created_at)
    VALUES ('Kemungkinan ada drift GPS karena sinyal satelit lemah di area indoor. Akan coba factory reset unit.', eko_id, ticket_10008, NOW() - INTERVAL '6 hours');

    -- Notes for ticket 10009 (Kemenhub integration)
    INSERT INTO notes (content, user_id, ticket_id, created_at)
    VALUES ('Cek API log ke Kemenhub. Ada beberapa request yang gagal dengan response 401 Unauthorized. Kemungkinan token expired.', bambang_id, ticket_10009, NOW() - INTERVAL '1 hour');

    -- Notes for ticket 10012 (Engine shutdown)
    INSERT INTO notes (content, user_id, ticket_id, created_at)
    VALUES ('URGENT: Pelanggan melaporkan kendaraan bergerak ke arah luar kota. Koordinasi dengan tim teknis untuk remote shutdown.', dewi_id, ticket_10012, NOW() - INTERVAL '30 minutes');

END $$;

-- =============================================
-- VERIFICATION
-- =============================================

SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'activities', COUNT(*) FROM activities
UNION ALL
SELECT 'notes', COUNT(*) FROM notes;
