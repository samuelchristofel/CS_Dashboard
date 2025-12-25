// User Roles
export type UserRole = 'junior' | 'senior' | 'it' | 'admin';

// User
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isOnline?: boolean;
  createdAt: Date;
}

// Ticket Priority
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

// Ticket Status
export type TicketStatus = 
  | 'OPEN' 
  | 'TRIAGE' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'CLOSED'
  | 'PENDING_REVIEW'
  | 'WITH_IT';

// Ticket Source
export type TicketSource = 'Freshchat' | 'WhatsApp' | 'Email' | 'Phone';

// Ticket
export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  source: TicketSource;
  
  // Relations
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerCompany?: string;
  
  assignedToId?: string;
  assignedTo?: User;
  createdById: string;
  createdBy?: User;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

// Message (for chat)
export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  isRead: boolean;
}

// Activity Timeline
export interface Activity {
  id: string;
  ticketId: string;
  action: string;
  description: string;
  userId: string;
  user?: User;
  createdAt: Date;
}

// Stats
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  score?: number;
}
