-- =============================================
-- COMPREHENSIVE SEED DATA FOR VASTEL CS DASHBOARD
-- =============================================
-- This script populates the database with realistic ticket data
-- Run this in Supabase SQL Editor

-- 1. CLEAR EXISTING DATA (keeps users intact)
-- =============================================
DELETE FROM activities;
DELETE FROM notes;
DELETE FROM tickets;

-- 2. GET USER IDs DYNAMICALLY
-- =============================================
-- We'll use CTEs to get user IDs by role

-- 3. INSERT TICKETS
-- =============================================
-- Ticket distribution plan:
-- - 120 total tickets
-- - 15 unassigned (fresh)
-- - 20 assigned to Senior CS
-- - 15 assigned to IT (WITH_IT status)
-- - 70 distributed among 9 juniors with performance tiers:
--   * Top performers (3): ~12-15 tickets each = 38
--   * Mid performers (3): ~6-8 tickets each = 21
--   * Low performers (3): ~2-4 tickets each = 11

DO $$
DECLARE
    -- User IDs
    senior_id UUID;
    it_id UUID;
    junior_ids UUID[];
    
    -- Counters
    ticket_num INTEGER := 1;
    i INTEGER;
    
    -- Random helpers
    random_priority TEXT;
    random_source TEXT;
    random_status TEXT;
    random_date TIMESTAMP;
    days_ago INTEGER;
    
BEGIN
    -- Get Senior CS user
    SELECT id INTO senior_id FROM users WHERE role = 'senior' LIMIT 1;
    
    -- Get IT user
    SELECT id INTO it_id FROM users WHERE role = 'it' LIMIT 1;
    
    -- Get all Junior CS users (should be 9)
    SELECT ARRAY_AGG(id ORDER BY name) INTO junior_ids FROM users WHERE role = 'junior';
    
    -- ===============================
    -- UNASSIGNED TICKETS (15)
    -- Fresh tickets, OPEN or TRIAGE
    -- ===============================
    FOR i IN 1..15 LOOP
        random_priority := (ARRAY['HIGH', 'MEDIUM', 'LOW'])[floor(random() * 3 + 1)];
        random_source := (ARRAY['WhatsApp', 'Email', 'Phone', 'Freshchat'])[floor(random() * 4 + 1)];
        random_status := (ARRAY['OPEN', 'TRIAGE'])[floor(random() * 2 + 1)];
        days_ago := floor(random() * 3); -- 0-2 days ago
        
        INSERT INTO tickets (
            number, subject, description, customer_name, customer_email, customer_phone,
            priority, status, source, created_at, updated_at
        ) VALUES (
            ticket_num,
            (ARRAY[
                'Cannot access my account',
                'Payment failed',
                'App keeps crashing',
                'Need refund request',
                'Billing inquiry',
                'Service not working',
                'Technical issue with login',
                'Account suspension query',
                'Product quality complaint',
                'Delivery status update',
                'Password reset help',
                'Subscription cancellation',
                'Feature request',
                'Data not syncing',
                'Connection timeout error'
            ])[i],
            'Customer reported issue that needs attention.',
            'Customer ' || (1000 + i),
            'customer' || (1000 + i) || '@email.com',
            '08' || lpad((1000000000 + floor(random() * 999999999)::bigint)::text, 11, '0'),
            random_priority,
            random_status,
            random_source,
            NOW() - (days_ago || ' days')::interval - (floor(random() * 12) || ' hours')::interval,
            NOW() - (days_ago || ' days')::interval
        );
        ticket_num := ticket_num + 1;
    END LOOP;

    -- ===============================
    -- SENIOR CS TICKETS (20)
    -- Various statuses
    -- ===============================
    FOR i IN 1..20 LOOP
        random_priority := (ARRAY['HIGH', 'MEDIUM', 'LOW'])[floor(random() * 3 + 1)];
        random_source := (ARRAY['WhatsApp', 'Email', 'Phone', 'Freshchat'])[floor(random() * 4 + 1)];
        random_status := (ARRAY['IN_PROGRESS', 'RESOLVED', 'CLOSED', 'PENDING_REVIEW'])[floor(random() * 4 + 1)];
        days_ago := floor(random() * 25 + 1); -- 1-25 days ago
        
        INSERT INTO tickets (
            number, subject, description, customer_name, customer_email, customer_phone,
            priority, status, source, assigned_to_id, created_at, updated_at, closed_at
        ) VALUES (
            ticket_num,
            (ARRAY[
                'VIP customer complaint',
                'Escalated billing issue',
                'Complex technical problem',
                'Priority account review',
                'Service level breach',
                'Executive customer inquiry',
                'Multi-department coordination',
                'Compliance related query',
                'Security concern raised',
                'System-wide issue report',
                'Premium service request',
                'Critical bug report',
                'Account recovery complex',
                'Legal department query',
                'Enterprise client issue',
                'API integration problem',
                'Data migration request',
                'Bulk account issue',
                'Partnership inquiry',
                'Contract dispute'
            ])[i],
            'Senior-level ticket requiring expertise.',
            'Customer ' || (2000 + i),
            'customer' || (2000 + i) || '@company.com',
            '08' || lpad((2000000000 + floor(random() * 999999999)::bigint)::text, 11, '0'),
            random_priority,
            random_status,
            random_source,
            senior_id,
            NOW() - (days_ago || ' days')::interval,
            NOW() - ((days_ago - floor(random() * 3)) || ' days')::interval,
            CASE WHEN random_status IN ('RESOLVED', 'CLOSED') 
                THEN NOW() - ((days_ago - floor(random() * 5)) || ' days')::interval 
                ELSE NULL 
            END
        );
        ticket_num := ticket_num + 1;
    END LOOP;

    -- ===============================
    -- IT SUPPORT TICKETS (15)
    -- WITH_IT or PENDING_REVIEW status
    -- ===============================
    FOR i IN 1..15 LOOP
        random_priority := (ARRAY['HIGH', 'MEDIUM', 'LOW'])[floor(random() * 3 + 1)];
        random_source := (ARRAY['WhatsApp', 'Email', 'Freshchat'])[floor(random() * 3 + 1)];
        random_status := (ARRAY['WITH_IT', 'PENDING_REVIEW'])[floor(random() * 2 + 1)];
        days_ago := floor(random() * 20 + 1); -- 1-20 days ago
        
        INSERT INTO tickets (
            number, subject, description, customer_name, customer_email, customer_phone,
            priority, status, source, assigned_to_id, created_at, updated_at
        ) VALUES (
            ticket_num,
            (ARRAY[
                'Server connection error',
                'Database sync failure',
                'API endpoint not responding',
                'SSL certificate issue',
                'Load balancer problem',
                'Caching not working',
                'Memory leak detected',
                'CPU usage spike',
                'Disk space critical',
                'Network latency issue',
                'Firewall blocking requests',
                'DNS resolution failure',
                'Container crash loop',
                'Queue processing stuck',
                'Backup restoration needed'
            ])[i],
            'Technical issue requiring IT intervention.',
            'Customer ' || (3000 + i),
            'customer' || (3000 + i) || '@tech.com',
            '08' || lpad((3000000000 + floor(random() * 999999999)::bigint)::text, 11, '0'),
            random_priority,
            random_status,
            random_source,
            it_id,
            NOW() - (days_ago || ' days')::interval,
            NOW() - ((days_ago - floor(random() * 2)) || ' days')::interval
        );
        ticket_num := ticket_num + 1;
    END LOOP;

    -- ===============================
    -- TOP PERFORMER JUNIORS (3 agents, 12-15 tickets each = ~40)
    -- Agents at index 1, 2, 3
    -- ===============================
    FOR i IN 1..40 LOOP
        random_priority := (ARRAY['HIGH', 'MEDIUM', 'LOW'])[floor(random() * 3 + 1)];
        random_source := (ARRAY['WhatsApp', 'Email', 'Phone', 'Freshchat'])[floor(random() * 4 + 1)];
        random_status := (ARRAY['RESOLVED', 'CLOSED', 'CLOSED', 'RESOLVED'])[floor(random() * 4 + 1)]; -- Mostly completed
        days_ago := floor(random() * 28 + 1); -- 1-28 days ago
        
        INSERT INTO tickets (
            number, subject, description, customer_name, customer_email, customer_phone,
            priority, status, source, assigned_to_id, created_at, updated_at, closed_at
        ) VALUES (
            ticket_num,
            (ARRAY[
                'Account login issue',
                'Password reset request',
                'Billing question',
                'Service activation',
                'Plan upgrade inquiry',
                'Refund request',
                'Payment confirmation',
                'Address update needed',
                'Subscription change',
                'Product availability',
                'Delivery tracking',
                'Order modification',
                'Promo code issue',
                'App installation help',
                'Settings configuration',
                'Notification preferences',
                'Email not received',
                'SMS verification failed',
                'Two-factor auth help',
                'Profile update request'
            ])[((i - 1) % 20) + 1],
            'Standard customer support ticket.',
            'Customer ' || (4000 + i),
            'customer' || (4000 + i) || '@gmail.com',
            '08' || lpad((4000000000 + floor(random() * 999999999)::bigint)::text, 11, '0'),
            random_priority,
            random_status,
            random_source,
            junior_ids[((i - 1) % 3) + 1], -- Distribute among first 3 juniors
            NOW() - (days_ago || ' days')::interval,
            NOW() - ((days_ago - 1) || ' days')::interval,
            NOW() - ((days_ago - floor(random() * 2)) || ' days')::interval -- Fast resolution
        );
        ticket_num := ticket_num + 1;
    END LOOP;

    -- ===============================
    -- MID PERFORMER JUNIORS (3 agents, 6-8 tickets each = ~20)
    -- Agents at index 4, 5, 6
    -- ===============================
    FOR i IN 1..20 LOOP
        random_priority := (ARRAY['HIGH', 'MEDIUM', 'LOW'])[floor(random() * 3 + 1)];
        random_source := (ARRAY['WhatsApp', 'Email', 'Phone', 'Freshchat'])[floor(random() * 4 + 1)];
        random_status := (ARRAY['RESOLVED', 'CLOSED', 'IN_PROGRESS', 'PENDING_REVIEW'])[floor(random() * 4 + 1)];
        days_ago := floor(random() * 28 + 1);
        
        INSERT INTO tickets (
            number, subject, description, customer_name, customer_email, customer_phone,
            priority, status, source, assigned_to_id, created_at, updated_at, closed_at
        ) VALUES (
            ticket_num,
            (ARRAY[
                'Cannot make payment',
                'Invoice discrepancy',
                'Service interruption',
                'Feature not working',
                'Slow performance',
                'Data export needed',
                'Report generation issue',
                'Integration problem',
                'Mobile app bug',
                'Desktop sync issue',
                'Calendar not updating',
                'Contact import failed',
                'Backup restore help',
                'Storage limit reached',
                'Team access request',
                'Permission denied error',
                'File upload failing',
                'Download corrupted',
                'Print layout wrong',
                'Export format issue'
            ])[i],
            'Customer support ticket requiring attention.',
            'Customer ' || (5000 + i),
            'customer' || (5000 + i) || '@yahoo.com',
            '08' || lpad((5000000000 + floor(random() * 999999999)::bigint)::text, 11, '0'),
            random_priority,
            random_status,
            random_source,
            junior_ids[((i - 1) % 3) + 4], -- Distribute among juniors 4, 5, 6
            NOW() - (days_ago || ' days')::interval,
            NOW() - ((days_ago - 2) || ' days')::interval,
            CASE WHEN random_status IN ('RESOLVED', 'CLOSED') 
                THEN NOW() - ((days_ago - floor(random() * 4)) || ' days')::interval 
                ELSE NULL 
            END
        );
        ticket_num := ticket_num + 1;
    END LOOP;

    -- ===============================
    -- LOW PERFORMER JUNIORS (3 agents, 2-4 tickets each = ~10)
    -- Agents at index 7, 8, 9
    -- ===============================
    FOR i IN 1..10 LOOP
        random_priority := (ARRAY['HIGH', 'MEDIUM', 'LOW'])[floor(random() * 3 + 1)];
        random_source := (ARRAY['WhatsApp', 'Email', 'Phone', 'Freshchat'])[floor(random() * 4 + 1)];
        random_status := (ARRAY['IN_PROGRESS', 'PENDING_REVIEW', 'RESOLVED', 'CLOSED'])[floor(random() * 4 + 1)];
        days_ago := floor(random() * 28 + 1);
        
        INSERT INTO tickets (
            number, subject, description, customer_name, customer_email, customer_phone,
            priority, status, source, assigned_to_id, created_at, updated_at, closed_at
        ) VALUES (
            ticket_num,
            (ARRAY[
                'General inquiry',
                'How to use feature',
                'Pricing question',
                'Account information',
                'Service hours',
                'Location inquiry',
                'Contact update',
                'Feedback submission',
                'Complaint follow-up',
                'Status check'
            ])[i],
            'Customer support ticket.',
            'Customer ' || (6000 + i),
            'customer' || (6000 + i) || '@outlook.com',
            '08' || lpad((6000000000 + floor(random() * 999999999)::bigint)::text, 11, '0'),
            random_priority,
            random_status,
            random_source,
            junior_ids[((i - 1) % 3) + 7], -- Distribute among juniors 7, 8, 9
            NOW() - (days_ago || ' days')::interval,
            NOW() - ((days_ago - 3) || ' days')::interval,
            CASE WHEN random_status IN ('RESOLVED', 'CLOSED') 
                THEN NOW() - ((days_ago - floor(random() * 7)) || ' days')::interval -- Slower resolution
                ELSE NULL 
            END
        );
        ticket_num := ticket_num + 1;
    END LOOP;

    RAISE NOTICE 'Seed data complete! Total tickets: %', ticket_num - 1;
END $$;

-- 4. ADD SOME NOTES TO RANDOM TICKETS
-- =============================================
INSERT INTO notes (ticket_id, user_id, content, created_at)
SELECT 
    t.id,
    (SELECT id FROM users WHERE role = 'senior' LIMIT 1),
    (ARRAY[
        'Customer contacted, issue acknowledged.',
        'Escalated to senior team for review.',
        'Waiting for customer response.',
        'Issue resolved, pending customer confirmation.',
        'Technical team investigating.',
        'Refund processed successfully.',
        'Follow-up scheduled for next week.',
        'Customer satisfied with resolution.'
    ])[floor(random() * 8 + 1)],
    t.created_at + interval '2 hours'
FROM tickets t
WHERE random() < 0.3 -- 30% of tickets get notes
LIMIT 30;

-- 5. VERIFY DATA
-- =============================================
SELECT 
    'Summary' as info,
    COUNT(*) as total_tickets,
    COUNT(*) FILTER (WHERE assigned_to_id IS NULL) as unassigned,
    COUNT(*) FILTER (WHERE status = 'OPEN') as open,
    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
    COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved,
    COUNT(*) FILTER (WHERE status = 'CLOSED') as closed,
    COUNT(*) FILTER (WHERE status = 'WITH_IT') as with_it,
    COUNT(*) FILTER (WHERE status = 'PENDING_REVIEW') as pending_review
FROM tickets;
