# Vastel HelpDesk - TODO List

> **Last Updated:** December 31, 2024  
> **Full Details:** See `QA_FEEDBACK_TASKS.md`

---

## ✅ COMPLETED

- [x] MySQL Migration (from Supabase)
- [x] Prisma ORM Setup
- [x] All API Routes Working
- [x] Chat Widget with Polling
- [x] Database Seeding
- [x] Date Formatting Fix

---

## 🔴 PHASE 1: Core Workflow (HIGH PRIORITY)

### Junior CS Changes ✅ DONE
- [x] Add self-assignment for LOW/MEDIUM tickets
- [x] Remove "Pending Review" - direct resolve for LOW/MEDIUM
- [x] Add "Escalate to IT" button for MEDIUM/HIGH


### Status Flow Changes
- [ ] Add `PENDING` status (starting point after assignment)
- [ ] Add `PAUSED_BY_CUSTOMER` status (long-term cases)
- [ ] Flow: OPEN → PENDING → IN_PROGRESS → RESOLVED → CLOSED
- [ ] Remove `TRIAGE` status (same as OPEN)

### Action Logging
- [ ] Log when ticket is self-claimed (bonus score)
- [ ] Require note/reason when clicking "Resolve"
- [ ] Require note when IT clicks "Mark as Fixed"
- [ ] Log IT assignment with assignee name

---

## 🟠 PHASE 2: KPI System (MEDIUM PRIORITY)

- [ ] Remove monthly ticket target
- [ ] Use percentage-based scoring
- [ ] Score = tickets taken + resolution speed
- [ ] Add initiative bonus for self-claiming
- [ ] SLA penalties: LOW=1day, MEDIUM=2days, HIGH=3days
- [ ] Show KPI formula info in Admin settings

---

## 🟡 PHASE 3: UI Fixes (LOW-MEDIUM PRIORITY)

### Layout Changes
- [ ] Admin: System Activity above Admin Actions
- [ ] CS Dashboards: Ticket Details above CS Actions
- [ ] Reduce border radius (less rounded)
- [ ] Wider modals (2-column layout)

### Color Fixes
- [ ] LOW priority → GREEN (not blue)
- [ ] IN_PROGRESS color consistency

### Text Changes
- [ ] "My Activity" → "Logs"
- [ ] Assigned To: Show initials "RP" + role, not full name
- [ ] Senior CS & Junior CS dashboard layout consistency

### Form Improvements
- [ ] Customer Email = required in Create Ticket
- [ ] Avatar upload (not URL) in Add User
- [ ] Subject dropdown → predefined categories

---

## 🟢 PHASE 4: Reports & Analytics

- [ ] Add custom date range picker (start/end date)
- [ ] Add "This Year" option to filters
- [ ] Show Pending/Open count in reports
- [ ] Split per-agent reports in Admin
- [ ] Add Reports page to Junior CS
- [ ] System Overview: custom date picker

---

## 🔵 PHASE 5: New Features

### Chat
- [ ] Convert Chat Widget → dedicated `/chat` page

### Tickets Page
- [ ] Add "Latest Update" column with sort arrows
- [ ] Add filter for stale tickets (>3 months)
- [ ] Handle long subjects (truncate or wrap)

### IT Backlog
- [ ] Create internal todo/backlog page for IT
- [ ] No customer attached
- [ ] For tracking future development

### Notifications
- [ ] Toast for new tickets (longer duration)
- [ ] Replace History → Notification History
- [ ] Add notification bell with unread count
- [ ] Mark as Read buttons

### Audit
- [ ] Add search bar to Audit Logs

---

## 🟣 PHASE 6: AI Features (OPTIONAL)

- [ ] AI Priority Classification (Gemini)
- [ ] Best Performance Agent (weekly)
- [ ] Problem Summary Analytics
- [ ] Customer Analytics (frequent complainers)

---

## 📱 PHASE 7: Mobile (OPTIONAL)

- [ ] Mobile-friendly dashboard

---

## 📊 PROGRESS TRACKER

| Phase | Status | Tasks | Done |
|-------|--------|-------|------|
| Phase 1 | 🔴 Not Started | 11 | 0 |
| Phase 2 | 🔴 Not Started | 6 | 0 |
| Phase 3 | 🔴 Not Started | 11 | 0 |
| Phase 4 | 🔴 Not Started | 6 | 0 |
| Phase 5 | 🔴 Not Started | 10 | 0 |
| Phase 6 | 🔴 Not Started | 4 | 0 |
| Phase 7 | 🔴 Not Started | 1 | 0 |
| **TOTAL** | | **49** | **0** |

---

## 🗄️ SCHEMA CHANGES NEEDED

```
New Status: PENDING, PAUSED_BY_CUSTOMER
Remove Status: TRIAGE

New Models:
- TicketCategory (subject dropdown)
- ITBacklog (internal todo)
- Notification (notification system)
```

---

## 🔗 QUICK LINKS

- Full QA Details: `QA_FEEDBACK_TASKS.md`
- Credentials: `CREDENTIALS.md`
- KPI System: `KPI_SYSTEM.md`
- API Docs: `README.md`
