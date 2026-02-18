# Development Task Breakdown: Vastel Helpdesk Application

> **Purpose**: This document lists all the development tasks required to build this project from scratch, organized by job role/skill area.

---

## 1. Project Setup & Configuration

| Task | Description |
|------|-------------|
| Initialize Next.js 16 project | `npx create-next-app@latest` with TypeScript |
| Configure Tailwind CSS 4 | Install and set up `tailwind.config.ts` |
| Set up Prisma ORM | Install `@prisma/client`, create `schema.prisma` |
| Configure MySQL database | Create database, set `DATABASE_URL` in `.env` |
| Create project structure | Set up `src/app`, `src/components`, `src/lib`, `src/types` folders |

---

## 2. Database Design & Implementation

| Task | Description |
|------|-------------|
| Design User model | Fields: `id`, `name`, `email`, `password`, `role`, `avatar` |
| Design Ticket model | Fields: `id`, `number`, `subject`, `description`, `priority`, `status`, `customerName`, `customerEmail`, `assignedToId`, `createdById`, timestamps |
| Design Note model | For internal ticket comments |
| Design Activity model | For audit logging |
| Design Chat models | `Conversation`, `ConversationParticipant`, `Message` |
| Create Enums | `Role`, `Priority`, `TicketStatus`, `ConversationType`, `MessageType` |
| Set up relations | Foreign keys between User, Ticket, Note, Activity |
| Create seed script | Populate demo users and sample tickets |

---

## 3. Backend API Development

### 3.1 Authentication
| Task | Description |
|------|-------------|
| Create `/api/auth/login` | POST endpoint for credential validation |
| Create `/api/auth/heartbeat` | Session keep-alive endpoint |

### 3.2 User Management
| Task | Description |
|------|-------------|
| Create `/api/users` GET | List all users (exclude passwords) |
| Create `/api/users` POST | Create new user with validation |
| Create `/api/users/[id]` GET | Get single user |
| Create `/api/users/[id]` PATCH | Update user |
| Create `/api/users/[id]` DELETE | Delete user |

### 3.3 Ticket Management
| Task | Description |
|------|-------------|
| Create `/api/tickets` GET | List tickets with filters (status, priority, assigned_to, unassigned) |
| Create `/api/tickets` POST | Create ticket with auto-numbering |
| Create `/api/tickets/[id]` GET | Get single ticket with relations |
| Create `/api/tickets/[id]` PATCH | Update ticket status, assignment |
| Create `/api/tickets/[id]` DELETE | Delete ticket |
| Create `/api/tickets/[id]/notes` GET | Get notes for ticket |
| Create `/api/tickets/[id]/notes` POST | Add note to ticket |

### 3.4 Statistics & Analytics
| Task | Description |
|------|-------------|
| Create `/api/stats` GET | Dashboard statistics with period filtering |
| Implement KPI scoring logic | Base score + Speed bonus + Quality bonus calculation |
| Implement trend aggregation | Daily/monthly ticket volume and handling time |

### 3.5 Activity Logging
| Task | Description |
|------|-------------|
| Create `/api/activities` GET | Get activity feed with filters |
| Auto-log ticket actions | Log creation, status changes, assignments |

### 3.6 Chat System
| Task | Description |
|------|-------------|
| Create `/api/chat/users` GET | List users for chat contacts |
| Create `/api/chat/conversations` POST | Create/get conversation |
| Create `/api/chat/messages` GET | Get messages for conversation |
| Create `/api/chat/messages` POST | Send message |

---

## 4. Frontend Development

### 4.1 Layout & Navigation
| Task | Description |
|------|-------------|
| Create root layout | Global providers, fonts, metadata |
| Create agents layout | Role-based sidebar, auth protection |
| Create Sidebar component | Navigation links, user info, logout |
| Implement role-based routing | Redirect users to correct dashboard |

### 4.2 Login Page
| Task | Description |
|------|-------------|
| Create login form | Email + password inputs |
| Implement login logic | API call, localStorage storage, redirect |
| Add error handling | Invalid credentials toast |

### 4.3 Dashboard Pages
| Task | Description |
|------|-------------|
| Create Senior dashboard | ScoreCard, StatCards, Active Tickets list, Actions panel |
| Create Junior dashboard | My Tickets tab, Available Tickets tab, Claim functionality |
| Create IT dashboard | Technical tickets list, Mark as Fixed action |
| Create Admin dashboard | System overview, Team performance, Admin actions |

### 4.4 Reusable Components
| Task | Description |
|------|-------------|
| Create ScoreCard | Displays user KPI score with role-based styling |
| Create StatCard | Single metric display card |
| Create TicketCard | Ticket preview with priority/status badges |
| Create NotesPanel | Display and add notes to tickets |
| Create Modal component | Base modal wrapper |
| Create ConfirmModal | Confirmation dialog for actions |
| Create AddNoteModal | Form for adding notes |
| Create AddUserModal | Form for creating users (Admin) |
| Create CustomSelect | Styled dropdown component |

### 4.5 Chat Widget
| Task | Description |
|------|-------------|
| Create ChatWidget component | Floating chat button |
| Implement contacts list | Group by role, search, filter |
| Implement conversation view | Messages list, send functionality |
| Make widget draggable | Using `react-rnd` |
| Implement polling | Refresh messages every 3 seconds |

### 4.6 Additional Pages
| Task | Description |
|------|-------------|
| Create Tickets list page | Full ticket table with sorting/filtering |
| Create Reports page | Analytics charts using Recharts |
| Create Audit page | Activity log viewer |
| Create History page | Per-user activity history |

---

## 5. Styling & UI Polish

| Task | Description |
|------|-------------|
| Define color palette | Role-based colors (Senior=red, Junior=green, IT=blue, Admin=slate) |
| Create utility classes | `shadow-soft`, `no-scrollbar`, animations |
| Ensure responsive design | Mobile-friendly layouts |
| Add loading states | Spinners for async operations |
| Add toast notifications | Success/error feedback using `react-hot-toast` |

---

## 6. Testing & Quality Assurance

| Task | Description |
|------|-------------|
| Test all API endpoints | Verify CRUD operations |
| Test role-based access | Ensure users can only access their dashboard |
| Test ticket workflows | Status transitions, assignments |
| Test edge cases | Empty states, validation errors |

---

## Summary by Developer Role

| Role | Responsibility |
|------|----------------|
| **Backend Developer** | Database schema, API routes, business logic (Sections 2, 3) |
| **Frontend Developer** | React components, pages, state management (Section 4) |
| **UI/UX Designer** | Design system, component styling, responsive layouts (Section 5) |
| **Full-Stack Developer** | All of the above |
| **DevOps** | Database setup, environment configuration (Section 1) |
| **QA Engineer** | Testing all features (Section 6) |

---

## Estimated Effort

| Phase | Estimated Hours |
|-------|-----------------|
| Project Setup | 4-6 hours |
| Database Design | 6-8 hours |
| Backend APIs | 20-30 hours |
| Frontend Development | 40-60 hours |
| Styling & Polish | 10-15 hours |
| Testing | 10-15 hours |
| **Total** | **~90-135 hours** |
