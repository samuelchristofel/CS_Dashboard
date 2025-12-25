# HelpDesk Next.js Migration - TODO

## ✅ DONE

### Core Setup
- [x] Next.js 16 project with TypeScript + Tailwind
- [x] **Route Groups architecture** `(agents)` for clean URLs
- [x] Global styles with custom colors and shadows
- [x] TypeScript types for User, Ticket, Message, etc.

### Reusable Components
- [x] Sidebar component (role-based navigation)
- [x] ScoreCard component (role-based gradients)
- [x] StatCard component
- [x] TicketCard component (dashboard cards)
- [x] ChatWidget component (floating chat)
- [x] TicketTable component (table view)
- [x] TicketFilters component (search, filters)
- [x] HistoryContent component (shared history)

### Pages Created - All using Route Groups
- [x] Login page `/login`
- [x] Senior Dashboard `/senior`
- [x] Senior Tickets `/senior/tickets`
- [x] Senior Reports `/senior/reports`
- [x] Senior History `/senior/history`
- [x] Junior Dashboard `/junior`
- [x] Junior Tickets `/junior/tickets`
- [x] Junior History `/junior/history`
- [x] IT Dashboard `/it`
- [x] IT Tickets `/it/tickets`
- [x] IT History `/it/history`
- [x] Admin Dashboard `/admin`
- [x] Admin Tickets `/admin/tickets`
- [x] Admin Users `/admin/users`
- [x] Admin Reports `/admin/reports`
- [x] Admin Analytics `/admin/analytics`
- [x] Admin Audit `/admin/audit`
- [x] Admin History `/admin/history`

---

## 🟢 LOW Priority (Backend Integration)

### Database Setup
- [ ] Install Prisma ORM
- [ ] Create database schema (User, Ticket, Message, Activity)
- [ ] Seed with demo data
- [ ] Connect to SQLite (dev) / PostgreSQL (prod)

### Authentication
- [ ] Install NextAuth.js
- [ ] Configure login/logout
- [ ] Role-based route protection
- [ ] Session management

### API Routes
- [ ] `POST /api/tickets` - Create ticket
- [ ] `GET /api/tickets` - List tickets (with filters)
- [ ] `PATCH /api/tickets/[id]` - Update ticket status
- [ ] `GET /api/tickets/[id]` - Get single ticket
- [ ] `POST /api/messages` - Send chat message
- [ ] `GET /api/messages` - Get messages

### Modal Implementations
- [ ] Create Ticket Modal (form with validation)
- [ ] Assign Ticket Modal (agent selection)
- [ ] Ticket Detail Modal (full info + timeline)

### Real-time Features
- [ ] WebSocket for chat
- [ ] Real-time ticket updates
- [ ] Notifications

---

## 📊 Progress Summary

| Category | Done | Remaining |
|----------|------|-----------|
| Core Setup | 4/4 | 0 |
| Components | 8/8 | 0 |
| Pages | 18/18 | 0 |
| **UI Total** | **30/30** | **0** |
| Backend | 0/10+ | All |

---

## 🎯 New URL Structure (Route Groups)

```
app/
├── (agents)/                    ← Route group (not in URL)
│   ├── layout.tsx              ← ONE shared layout for all roles
│   ├── senior/
│   │   ├── page.tsx            → /senior
│   │   ├── tickets/page.tsx    → /senior/tickets
│   │   ├── reports/page.tsx    → /senior/reports
│   │   └── history/page.tsx    → /senior/history
│   ├── junior/
│   │   ├── page.tsx            → /junior
│   │   ├── tickets/page.tsx    → /junior/tickets
│   │   └── history/page.tsx    → /junior/history
│   ├── it/
│   │   ├── page.tsx            → /it
│   │   ├── tickets/page.tsx    → /it/tickets
│   │   └── history/page.tsx    → /it/history
│   └── admin/
│       ├── page.tsx            → /admin
│       ├── tickets/page.tsx    → /admin/tickets
│       ├── users/page.tsx      → /admin/users
│       ├── reports/page.tsx    → /admin/reports
│       ├── analytics/page.tsx  → /admin/analytics
│       ├── audit/page.tsx      → /admin/audit
│       └── history/page.tsx    → /admin/history
├── login/
│   └── page.tsx                → /login
├── layout.tsx                  → Root layout
└── page.tsx                    → / (redirects to /login)
```

---

## Development Commands
```bash
cd helpdesk-app
npm run dev      # Start dev server at localhost:3000
npm run build    # Build for production
npm run start    # Start production server
```

## Test URLs
- http://localhost:3000/login
- http://localhost:3000/senior
- http://localhost:3000/senior/tickets
- http://localhost:3000/junior
- http://localhost:3000/it
- http://localhost:3000/admin
