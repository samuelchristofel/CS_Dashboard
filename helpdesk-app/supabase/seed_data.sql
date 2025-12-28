-- =============================================
-- VASTEL HELPDESK SEED DATA (V2 - Better Distribution)
-- Distributes tickets across ALL juniors
-- Run this in Supabase SQL Editor
-- =============================================

-- STEP 1: Clear only ticket-related data (KEEP USERS)
DELETE FROM messages;
DELETE FROM conversation_participants;
DELETE FROM conversations;
DELETE FROM activities;
DELETE FROM notes;
DELETE FROM tickets;

-- STEP 2: Insert tickets with DISTRIBUTED assignments across juniors
-- Uses OFFSET to assign to different junior agents

-- HIGH PRIORITY (IT and Juniors)
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10001', 'GPS Tracker Offline - Fleet 15 Vehicles', 
       'Our entire fleet of 15 trucks is showing offline in the dashboard since this morning.',
       'HIGH', 'WITH_IT', 'Freshchat', 'PT Logistik Nusantara', 'fleet@logistiknusa.co.id', '+6281234567001',
       (SELECT id FROM users WHERE role = 'it' LIMIT 1),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1.5 hours', NULL;

-- Junior 1
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10002', 'Real-time Tracking Delay Over 10 Minutes',
       'Location updates are delayed by more than 10 minutes. Critical for operations.',
       'HIGH', 'IN_PROGRESS', 'Email', 'CV Ekspedisi Cepat', 'ops@ekspedicepat.id', '+6281234567002',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3.5 hours', NULL;

INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10003', 'Cannot Access Admin Dashboard',
       'Getting 500 error when trying to login. Multiple users affected.',
       'HIGH', 'WITH_IT', 'Phone', 'PT Armada Transindo', 'admin@armadatrans.co.id', '+6281234567003',
       (SELECT id FROM users WHERE role = 'it' LIMIT 1),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', NULL;

-- Junior 2
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10004', 'Emergency: Geofence Alerts Not Working',
       'Geofence breach alerts stopped working. No notification received.',
       'HIGH', 'RESOLVED', 'Freshchat', 'PT Keamanan Prima', 'security@keamananprima.com', '+6281234567004',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days';

-- Junior 3
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10005', 'Battery Drain Issue on GPS Unit',
       'GPS device battery draining within 2 hours. Unit ID: VAS-2024-0892',
       'HIGH', 'PENDING_REVIEW', 'Email', 'Bapak Hendro', 'hendro.personal@gmail.com', '+6281234567005',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 2),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours', NULL;

-- MEDIUM PRIORITY - Distributed across all juniors

-- Junior 1
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10006', 'Request Additional User Accounts',
       'Need to add 5 new dispatcher accounts to fleet management system.',
       'MEDIUM', 'IN_PROGRESS', 'Email', 'PT Distribusi Mandiri', 'hr@distribusimandiri.co.id', '+6281234567006',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '1 day', NOW() - INTERVAL '20 hours', NULL;

-- OPEN (unassigned)
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10007', 'Monthly Report Not Generating',
       'December 2024 fleet report shows error when trying to export to PDF.',
       'MEDIUM', 'OPEN', 'Freshchat', 'CV Sumber Rezeki', 'admin@sumberrezeki.id', '+6281234567007',
       NULL, (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '30 minutes', NULL, NULL;

-- Junior 2
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10008', 'Speed Alert Threshold Configuration',
       'How to change speed alert from 80 km/h to 100 km/h for highway routes?',
       'MEDIUM', 'CLOSED', 'Freshchat', 'PT Trans Jaya', 'fleet@transjaya.co.id', '+6281234567008',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days';

-- Junior 3
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10009', 'Fuel Consumption Report Discrepancy',
       'Fuel usage shown in system doesnt match actual consumption. Difference of 15%.',
       'MEDIUM', 'IN_PROGRESS', 'Phone', 'PT Mitra Logistik', 'ops@mitralogistik.id', '+6281234567009',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 2),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL;

-- IT
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10010', 'Mobile App Crashing on Android',
       'Vastel mobile app keeps crashing on Samsung devices running Android 14.',
       'MEDIUM', 'WITH_IT', 'Email', 'Ibu Ratna', 'ratna.manager@gmail.com', '+6281234567010',
       (SELECT id FROM users WHERE role = 'it' LIMIT 1),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NULL;

-- Junior 1
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10011', 'Historical Data Export Request',
       'Need to export all tracking data from October 2024 for audit purposes.',
       'MEDIUM', 'RESOLVED', 'Email', 'PT Audit Indonesia', 'data@auditindo.co.id', '+6281234567011',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', NOW() - INTERVAL '5 days';

-- Junior 2
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10012', 'Driver ID Not Syncing',
       'Driver identification feature not working. Shows Unknown Driver for all vehicles.',
       'MEDIUM', 'PENDING_REVIEW', 'Freshchat', 'CV Prima Transport', 'admin@primatransport.id', '+6281234567012',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '8 hours', NOW() - INTERVAL '7 hours', NULL;

-- LOW PRIORITY - Distributed
-- OPEN (unassigned)
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10013', 'Feature Request: WhatsApp Notification',
       'Would like to receive alerts via WhatsApp instead of SMS.',
       'LOW', 'OPEN', 'Freshchat', 'PT Niaga Utama', 'cs@niagautama.co.id', '+6281234567013',
       NULL, (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '2 hours', NULL, NULL;

-- Junior 3
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10014', 'Request Training for New Staff',
       'We have 3 new dispatchers who need training on the GPS platform.',
       'LOW', 'IN_PROGRESS', 'Email', 'PT Jasa Kirim', 'training@jasakirim.id', '+6281234567014',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 2),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NULL;

-- Junior 1
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10015', 'Custom Report Template Request',
       'Need a customized weekly report template with fuel and distance summary.',
       'LOW', 'CLOSED', 'Email', 'Pak Sutrisno', 'sutrisno.fleet@yahoo.com', '+6281234567015',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '10 days';

-- Junior 2
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10016', 'Invoice Copy Request - November',
       'Please resend the invoice for November 2024 subscription.',
       'LOW', 'CLOSED', 'Freshchat', 'CV Berkat Jaya', 'finance@berkatjaya.co.id', '+6281234567016',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', NOW() - INTERVAL '6 days';

-- Junior 3
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10017', 'Change Billing Email Address',
       'Please update billing email from old@email.com to new@email.com',
       'LOW', 'RESOLVED', 'Phone', 'PT Sukses Makmur', 'admin@suksesmakmur.id', '+6281234567017',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 2),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days';

-- Junior 1
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10018', 'Temporary Account Access for Auditor',
       'Need read-only access for external auditor for 2 weeks.',
       'LOW', 'PENDING_REVIEW', 'Email', 'PT Akuntan Global', 'audit@akuntanglobal.com', '+6281234567018',
       (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0),
       (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '12 hours', NOW() - INTERVAL '10 hours', NULL;

-- OPEN tickets for Juniors to pick up (unassigned)
INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10019', 'New GPS Installation Quote',
       'Interested in installing GPS trackers for 20 vehicles. Please provide quotation.',
       'MEDIUM', 'OPEN', 'Email', 'PT Baru Maju', 'procurement@barumaju.id', '+6281234567019',
       NULL, (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '45 minutes', NULL, NULL;

INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10020', 'Subscription Renewal Inquiry',
       'Our subscription ends in 10 days. What are the renewal options?',
       'LOW', 'OPEN', 'Freshchat', 'CV Mandiri Abadi', 'admin@mandiriabadi.id', '+6281234567020',
       NULL, (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '1 hour', NULL, NULL;

INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10021', 'GPS Unit Replacement Warranty',
       'GPS unit stopped working. Want to claim warranty replacement.',
       'HIGH', 'OPEN', 'Phone', 'Pak Ahmad', 'ahmad.driver@gmail.com', '+6281234567021',
       NULL, (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '15 minutes', NULL, NULL;

INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, created_at, assigned_at, closed_at)
SELECT '10022', 'Cannot See Vehicle on Map',
       'Truck B 1234 XY not showing on the live map since yesterday.',
       'MEDIUM', 'OPEN', 'Freshchat', 'PT Cargo Express', 'dispatch@cargoexpress.id', '+6281234567022',
       NULL, (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
       NOW() - INTERVAL '2 hours', NULL, NULL;

-- STEP 3: Notes (using same junior distribution pattern)
INSERT INTO notes (ticket_id, user_id, content, created_at)
SELECT t.id, (SELECT id FROM users WHERE role = 'senior' LIMIT 1), 
       'Escalated to IT. Possibly server connectivity issue.',
       NOW() - INTERVAL '1.5 hours'
FROM tickets t WHERE t.number = '10001';

INSERT INTO notes (ticket_id, user_id, content, created_at)
SELECT t.id, (SELECT id FROM users WHERE role = 'it' LIMIT 1), 
       'Investigating. Found issue with firewall rules.',
       NOW() - INTERVAL '1 hour'
FROM tickets t WHERE t.number = '10001';

INSERT INTO notes (ticket_id, user_id, content, created_at)
SELECT t.id, (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0), 
       'Customer confirmed issue started at 6 AM.',
       NOW() - INTERVAL '3 hours'
FROM tickets t WHERE t.number = '10002';

INSERT INTO notes (ticket_id, user_id, content, created_at)
SELECT t.id, (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1), 
       'Fixed timezone setting in geofence config.',
       NOW() - INTERVAL '2 days'
FROM tickets t WHERE t.number = '10004';

INSERT INTO notes (ticket_id, user_id, content, created_at)
SELECT t.id, (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 2), 
       'Requested customer to check power connection.',
       NOW() - INTERVAL '4 hours'
FROM tickets t WHERE t.number = '10005';

INSERT INTO notes (ticket_id, user_id, content, created_at)
SELECT t.id, (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 2), 
       'Comparing fuel sensor readings with actual receipts.',
       NOW() - INTERVAL '1 day'
FROM tickets t WHERE t.number = '10009';

INSERT INTO notes (ticket_id, user_id, content, created_at)
SELECT t.id, (SELECT id FROM users WHERE role = 'it' LIMIT 1), 
       'Reproduced crash on Android 14 emulator.',
       NOW() - INTERVAL '1 day'
FROM tickets t WHERE t.number = '10010';

INSERT INTO notes (ticket_id, user_id, content, created_at)
SELECT t.id, (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0), 
       'Data exported and sent. Customer confirmed receipt.',
       NOW() - INTERVAL '5 days'
FROM tickets t WHERE t.number = '10011';

INSERT INTO notes (ticket_id, user_id, content, created_at)
SELECT t.id, (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1), 
       'Driver RFID tags need to be re-registered.',
       NOW() - INTERVAL '6 hours'
FROM tickets t WHERE t.number = '10012';

-- STEP 4: Conversations
INSERT INTO conversations (id, type, name, created_at, last_message, last_message_at) VALUES
('11111111-aaaa-bbbb-cccc-111111111111', 'direct', NULL, NOW() - INTERVAL '1 week', 'Sudah selesai ya pak isunya', NOW() - INTERVAL '2 hours'),
('22222222-aaaa-bbbb-cccc-222222222222', 'direct', NULL, NOW() - INTERVAL '5 days', 'Siap, nanti saya follow up customernya', NOW() - INTERVAL '4 hours'),
('33333333-aaaa-bbbb-cccc-333333333333', 'direct', NULL, NOW() - INTERVAL '3 days', 'Makasih ya untuk bantuannya!', NOW() - INTERVAL '1 day');

-- Participants
INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
SELECT '11111111-aaaa-bbbb-cccc-111111111111', id, NOW() - INTERVAL '1 week' FROM users WHERE role = 'admin' LIMIT 1;
INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
SELECT '11111111-aaaa-bbbb-cccc-111111111111', id, NOW() - INTERVAL '1 week' FROM users WHERE role = 'senior' LIMIT 1;
INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
SELECT '22222222-aaaa-bbbb-cccc-222222222222', id, NOW() - INTERVAL '5 days' FROM users WHERE role = 'senior' LIMIT 1;
INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
SELECT '22222222-aaaa-bbbb-cccc-222222222222', id, NOW() - INTERVAL '5 days' FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0;
INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
SELECT '33333333-aaaa-bbbb-cccc-333333333333', id, NOW() - INTERVAL '3 days' FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1;
INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
SELECT '33333333-aaaa-bbbb-cccc-333333333333', id, NOW() - INTERVAL '3 days' FROM users WHERE role = 'it' LIMIT 1;

-- Messages
INSERT INTO messages (conversation_id, sender_id, content, type, created_at)
SELECT '11111111-aaaa-bbbb-cccc-111111111111', id, 'Gimana progress ticket fleet offline?', 'text', NOW() - INTERVAL '3 hours'
FROM users WHERE role = 'admin' LIMIT 1;
INSERT INTO messages (conversation_id, sender_id, content, type, created_at)
SELECT '11111111-aaaa-bbbb-cccc-111111111111', id, 'Sudah di-escalate ke IT pak', 'text', NOW() - INTERVAL '2.5 hours'
FROM users WHERE role = 'senior' LIMIT 1;
INSERT INTO messages (conversation_id, sender_id, content, type, created_at)
SELECT '11111111-aaaa-bbbb-cccc-111111111111', id, 'Oke, tolong monitor ya', 'text', NOW() - INTERVAL '2.3 hours'
FROM users WHERE role = 'admin' LIMIT 1;
INSERT INTO messages (conversation_id, sender_id, content, type, created_at)
SELECT '11111111-aaaa-bbbb-cccc-111111111111', id, 'Sudah selesai ya pak isunya', 'text', NOW() - INTERVAL '2 hours'
FROM users WHERE role = 'senior' LIMIT 1;

INSERT INTO messages (conversation_id, sender_id, content, type, created_at)
SELECT '22222222-aaaa-bbbb-cccc-222222222222', id, 'Ticket 10006 bisa handle?', 'text', NOW() - INTERVAL '5 hours'
FROM users WHERE role = 'senior' LIMIT 1;
INSERT INTO messages (conversation_id, sender_id, content, type, created_at)
SELECT '22222222-aaaa-bbbb-cccc-222222222222', id, 'Bisa bu, yang request tambah user account ya?', 'text', NOW() - INTERVAL '4.8 hours'
FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0;
INSERT INTO messages (conversation_id, sender_id, content, type, created_at)
SELECT '22222222-aaaa-bbbb-cccc-222222222222', id, 'Iya betul. Koordinasi sama admin mereka', 'text', NOW() - INTERVAL '4.5 hours'
FROM users WHERE role = 'senior' LIMIT 1;
INSERT INTO messages (conversation_id, sender_id, content, type, created_at)
SELECT '22222222-aaaa-bbbb-cccc-222222222222', id, 'Siap, nanti saya follow up customernya', 'text', NOW() - INTERVAL '4 hours'
FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0;

INSERT INTO messages (conversation_id, sender_id, content, type, created_at)
SELECT '33333333-aaaa-bbbb-cccc-333333333333', id, 'Pak, customer minta data export. Sudah ready?', 'text', NOW() - INTERVAL '1.5 days'
FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1;
INSERT INTO messages (conversation_id, sender_id, content, type, created_at)
SELECT '33333333-aaaa-bbbb-cccc-333333333333', id, 'Sudah siap, nanti saya kirim linknya', 'text', NOW() - INTERVAL '1.3 days'
FROM users WHERE role = 'it' LIMIT 1;
INSERT INTO messages (conversation_id, sender_id, content, type, created_at)
SELECT '33333333-aaaa-bbbb-cccc-333333333333', id, 'Makasih ya untuk bantuannya!', 'text', NOW() - INTERVAL '1 day'
FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1;

-- STEP 5: Activities
INSERT INTO activities (action, details, user_id, ticket_id, created_at)
SELECT 'TICKET_CREATED', 'Ticket #10001 created', (SELECT id FROM users WHERE role = 'senior' LIMIT 1), t.id, NOW() - INTERVAL '2 hours'
FROM tickets t WHERE t.number = '10001';

INSERT INTO activities (action, details, user_id, ticket_id, created_at)
SELECT 'TICKET_ESCALATED', 'Ticket #10001 escalated to IT', (SELECT id FROM users WHERE role = 'senior' LIMIT 1), t.id, NOW() - INTERVAL '1.5 hours'
FROM tickets t WHERE t.number = '10001';

INSERT INTO activities (action, details, user_id, ticket_id, created_at)
SELECT 'TICKET_RESOLVED', 'Ticket #10004 resolved', (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1), t.id, NOW() - INTERVAL '2 days'
FROM tickets t WHERE t.number = '10004';

INSERT INTO activities (action, details, user_id, ticket_id, created_at)
SELECT 'TICKET_CLOSED', 'Ticket #10008 closed', (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1), t.id, NOW() - INTERVAL '4 days'
FROM tickets t WHERE t.number = '10008';

INSERT INTO activities (action, details, user_id, ticket_id, created_at)
SELECT 'TICKET_RESOLVED', 'Ticket #10011 resolved', (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0), t.id, NOW() - INTERVAL '5 days'
FROM tickets t WHERE t.number = '10011';

INSERT INTO activities (action, details, user_id, ticket_id, created_at)
SELECT 'TICKET_CLOSED', 'Ticket #10015 closed', (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 0), t.id, NOW() - INTERVAL '10 days'
FROM tickets t WHERE t.number = '10015';

INSERT INTO activities (action, details, user_id, ticket_id, created_at)
SELECT 'TICKET_CLOSED', 'Ticket #10016 closed', (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 1), t.id, NOW() - INTERVAL '6 days'
FROM tickets t WHERE t.number = '10016';

INSERT INTO activities (action, details, user_id, ticket_id, created_at)
SELECT 'TICKET_RESOLVED', 'Ticket #10017 resolved', (SELECT id FROM users WHERE role = 'junior' ORDER BY name LIMIT 1 OFFSET 2), t.id, NOW() - INTERVAL '2 days'
FROM tickets t WHERE t.number = '10017';

-- Summary
SELECT 
  'Seed data V2 complete! Tickets distributed across juniors.' AS status,
  (SELECT COUNT(*) FROM users WHERE role = 'junior') AS junior_count,
  (SELECT COUNT(*) FROM tickets WHERE assigned_to_id IS NOT NULL) AS assigned_tickets,
  (SELECT COUNT(*) FROM tickets WHERE assigned_to_id IS NULL) AS open_tickets;
