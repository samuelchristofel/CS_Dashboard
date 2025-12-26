-- =============================================
-- SEED DEMO DATA
-- Run this AFTER schema.sql
-- =============================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE users, tickets, notes, activities, messages CASCADE;

-- =============================================
-- INSERT DEMO USERS
-- =============================================

INSERT INTO users (name, email, password, role, avatar) VALUES
('Jay Won', 'jay@helpdesk.com', 'senior123', 'senior', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoS1f1jqiPLCv9wP1ZX5ODYa0ghkKGjzT0pHb0bhhH20OWJucjJF3IaQ3_s7kGdgzSrESvLELeRePVCXvRr6Yy6B44ot4XYOMJ8EMZqG-XCW3_LdyPn99i7jvXqfWcPrKLwpHBNINwHk8ii2yZhCVjb4ie45MSAzkKY1ThrKQqU6IW1IYNMpiJCMbLekMBKotxWueVnTbLJwOjHjthhnsBYumDmvRUF1jRAc8enpPdmTnLWmqaUL-YtKY7AbgW3bg6V9BjT3ZcykA'),
('Himari', 'himari@helpdesk.com', 'junior123', 'junior', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN0rsqgI4Fv1zrp1NtwFDfMAtVMQ2Oy1GVDJOvJ6nCUCQ7jsiVV56xA7nbgCm5tdWoz7uRJrvKLjNMVQjnTMrOkljsYHrZQXhnMHQ5CdvP5axphgV6bpBS37A56yKKtC62X_dV8ExJ__FV1vSZxJHnm6MtQpfaAfapPm0coFGD-DUok5mewrK8Mmy6ABuxS5_YsFmQs1t22lop8_n8TY7Vk9QXC4c9Gu2AMIHn2KB-a37kNDLDGLObRehy6a9NVQSgv140p_nRAM8'),
('Andi R.', 'andi@helpdesk.com', 'junior123', 'junior', NULL),
('Budi Santoso', 'budi@helpdesk.com', 'it123', 'it', NULL),
('Admin', 'admin@helpdesk.com', 'admin123', 'admin', NULL)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- INSERT DEMO TICKETS
-- =============================================

-- Get user IDs for foreign keys
DO $$
DECLARE
    jay_id UUID;
    himari_id UUID;
    budi_id UUID;
BEGIN
    SELECT id INTO jay_id FROM users WHERE email = 'jay@helpdesk.com';
    SELECT id INTO himari_id FROM users WHERE email = 'himari@helpdesk.com';
    SELECT id INTO budi_id FROM users WHERE email = 'budi@helpdesk.com';

    -- Ticket 1: High priority, in progress
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id)
    VALUES (
        '8821',
        'GPS device offline for 3 hours',
        'Customer reports that their GPS tracker has been offline since 10 AM. Needs urgent attention.',
        'HIGH',
        'IN_PROGRESS',
        'Freshchat',
        'PT. Trans Logistics',
        'logistics@trans.com',
        '0812****1234',
        jay_id,
        jay_id
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 2: Medium priority, pending review
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id)
    VALUES (
        '8820',
        'Invoice discrepancy for November',
        'Questions about invoice charges from last month. Customer disputes the amount.',
        'MEDIUM',
        'PENDING_REVIEW',
        'WhatsApp',
        'CV. Maju Bersama',
        'finance@maju.com',
        '0821****5678',
        himari_id,
        jay_id
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 3: High priority, with IT
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id)
    VALUES (
        '8819',
        'Server authentication error 500',
        'Unable to login to the mobile app. JWT token expiry issue suspected.',
        'HIGH',
        'WITH_IT',
        'Freshchat',
        'PT. Digital Solusi',
        'tech@digital.com',
        '0815****9012',
        budi_id,
        jay_id
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 4: Low priority, open/unassigned
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id)
    VALUES (
        '8818',
        'Request for fleet pricing quotation',
        'Customer interested in enterprise pricing for 50+ vehicles.',
        'LOW',
        'OPEN',
        'WhatsApp',
        'Sarah Williams',
        'sarah@logistics.com',
        '0856****3456',
        NULL,
        jay_id
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 5: Low priority, closed
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, closed_at)
    VALUES (
        '8817',
        'Password reset request',
        'Customer cannot remember their password.',
        'LOW',
        'CLOSED',
        'Freshchat',
        'Ahmad Fauzi',
        'ahmad@email.com',
        '0877****7890',
        himari_id,
        jay_id,
        NOW() - INTERVAL '2 hours'
    ) ON CONFLICT (number) DO NOTHING;

    -- Ticket 6: High priority, closed
    INSERT INTO tickets (number, subject, description, priority, status, source, customer_name, customer_email, customer_phone, assigned_to_id, created_by_id, closed_at)
    VALUES (
        '8816',
        'Vehicle not moving on map display',
        'Customer reports vehicle appears stationary on map for 2 days.',
        'HIGH',
        'CLOSED',
        'WhatsApp',
        'PT. Logistik Nusantara',
        'support@logistik.com',
        '0812****5678',
        jay_id,
        jay_id,
        NOW() - INTERVAL '1 day'
    ) ON CONFLICT (number) DO NOTHING;

END $$;

-- =============================================
-- INSERT ACTIVITY LOGS
-- =============================================

DO $$
DECLARE
    jay_id UUID;
    himari_id UUID;
    ticket_8821 UUID;
    ticket_8820 UUID;
    ticket_8819 UUID;
    ticket_8817 UUID;
BEGIN
    SELECT id INTO jay_id FROM users WHERE email = 'jay@helpdesk.com';
    SELECT id INTO himari_id FROM users WHERE email = 'himari@helpdesk.com';
    SELECT id INTO ticket_8821 FROM tickets WHERE number = '8821';
    SELECT id INTO ticket_8820 FROM tickets WHERE number = '8820';
    SELECT id INTO ticket_8819 FROM tickets WHERE number = '8819';
    SELECT id INTO ticket_8817 FROM tickets WHERE number = '8817';

    -- Activity 1
    INSERT INTO activities (action, details, user_id, ticket_id, created_at)
    VALUES ('TICKET_CREATED', 'Ticket #8821 created', jay_id, ticket_8821, NOW() - INTERVAL '3 hours');

    -- Activity 2
    INSERT INTO activities (action, details, user_id, ticket_id, created_at)
    VALUES ('TICKET_ASSIGNED', 'Assigned to Himari', jay_id, ticket_8820, NOW() - INTERVAL '2 hours');

    -- Activity 3
    INSERT INTO activities (action, details, user_id, ticket_id, created_at)
    VALUES ('TICKET_ESCALATED', 'Escalated to IT Support', jay_id, ticket_8819, NOW() - INTERVAL '1 hour');

    -- Activity 4
    INSERT INTO activities (action, details, user_id, ticket_id, created_at)
    VALUES ('TICKET_CLOSED', 'Ticket resolved and closed', himari_id, ticket_8817, NOW() - INTERVAL '30 minutes');

END $$;

-- =============================================
-- INSERT SAMPLE NOTES
-- =============================================

DO $$
DECLARE
    jay_id UUID;
    himari_id UUID;
    budi_id UUID;
    ticket_8821 UUID;
    ticket_8819 UUID;
BEGIN
    SELECT id INTO jay_id FROM users WHERE email = 'jay@helpdesk.com';
    SELECT id INTO himari_id FROM users WHERE email = 'himari@helpdesk.com';
    SELECT id INTO budi_id FROM users WHERE email = 'budi@helpdesk.com';
    SELECT id INTO ticket_8821 FROM tickets WHERE number = '8821';
    SELECT id INTO ticket_8819 FROM tickets WHERE number = '8819';

    -- Note 1
    INSERT INTO notes (content, user_id, ticket_id, created_at)
    VALUES ('Contacted customer, they confirmed the device was moved to a new vehicle.', jay_id, ticket_8821, NOW() - INTERVAL '2 hours');

    -- Note 2
    INSERT INTO notes (content, user_id, ticket_id, created_at)
    VALUES ('Checked server logs, found JWT token expiry at 10:30 AM. Investigating further.', budi_id, ticket_8819, NOW() - INTERVAL '45 minutes');

END $$;

-- =============================================
-- VERIFICATION
-- =============================================

-- Check counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'activities', COUNT(*) FROM activities
UNION ALL
SELECT 'notes', COUNT(*) FROM notes;
