import { createClient } from '@supabase/supabase-js';

// Supabase client for browser (client-side)
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Supabase client for server (with service role key for admin operations)
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types for database tables
export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'senior' | 'junior' | 'it' | 'admin';
    avatar: string | null;
    created_at: string;
    updated_at: string;
}

export interface Ticket {
    id: string;
    number: string;
    subject: string;
    description: string | null;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'OPEN' | 'TRIAGE' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'PENDING_REVIEW' | 'WITH_IT';
    source: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    assigned_to_id: string | null;
    created_by_id: string | null;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    // Joined data
    assigned_to?: User;
    created_by?: User;
}

export interface Note {
    id: string;
    content: string;
    user_id: string;
    ticket_id: string;
    created_at: string;
    // Joined data
    user?: User;
}

export interface Activity {
    id: string;
    action: string;
    details: string | null;
    user_id: string;
    ticket_id: string | null;
    created_at: string;
    // Joined data
    user?: User;
    ticket?: Ticket;
}

export interface Message {
    id: string;
    content: string;
    sender_id: string;
    receiver_id: string | null;
    ticket_id: string | null;
    read: boolean;
    created_at: string;
    // Joined data
    sender?: User;
    receiver?: User;
}
