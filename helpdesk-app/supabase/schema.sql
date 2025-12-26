  -- =============================================
  -- HELPDESK DATABASE SCHEMA
  -- Run this in Supabase SQL Editor
  -- =============================================

  -- 1. USERS TABLE
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'junior' CHECK (role IN ('senior', 'junior', 'it', 'admin')),
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 2. TICKETS TABLE
  CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'TRIAGE', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'PENDING_REVIEW', 'WITH_IT')),
    source TEXT DEFAULT 'Freshchat',
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
  );

  -- 3. NOTES TABLE
  CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 4. ACTIVITIES TABLE (Audit Log)
  CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    details TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 5. MESSAGES TABLE (Chat - Optional)
  CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- =============================================
  -- CREATE INDEXES FOR PERFORMANCE
  -- =============================================

  CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
  CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to_id);
  CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
  CREATE INDEX IF NOT EXISTS idx_activities_ticket_id ON activities(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_notes_ticket_id ON notes(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
  CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);

  -- =============================================
  -- ENABLE ROW LEVEL SECURITY (RLS)
  -- =============================================

  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
  ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies first (if they exist)
  DROP POLICY IF EXISTS "Allow all for users" ON users;
  DROP POLICY IF EXISTS "Allow all for tickets" ON tickets;
  DROP POLICY IF EXISTS "Allow all for notes" ON notes;
  DROP POLICY IF EXISTS "Allow all for activities" ON activities;
  DROP POLICY IF EXISTS "Allow all for messages" ON messages;

  -- Create policies to allow all operations for now (we'll tighten these later)
  CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all for tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all for notes" ON notes FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all for activities" ON activities FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all for messages" ON messages FOR ALL USING (true) WITH CHECK (true);
