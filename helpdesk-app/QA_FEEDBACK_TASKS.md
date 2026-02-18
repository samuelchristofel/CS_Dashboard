# CLIENT QA FEEDBACK - VALIDATED TASK LIST

> **Created:** December 31, 2024
> **Source:** Client QA Testing Session
> **Status:** 🟡 PENDING IMPLEMENTATION

---

## 📋 VALIDATION SUMMARY

Each item below has been validated against the current codebase. 
- ✅ = Confirmed issue exists and needs fixing
- 🟡 = Partially implemented or needs enhancement
- ❌ = Not applicable or already implemented
- 🆕 = New feature request

---

## SECTION 1: WORKFLOW & BUSINESS LOGIC CHANGES

### 1.1 Junior CS Self-Assignment Feature
**Status:** ✅ NEEDS IMPLEMENTATION  
**Current State:** Junior CS can only see tickets already assigned to them (line 66 in junior/page.tsx)  
**Required Change:** 
- Junior CS should be able to "self-assign" unassigned LOW and MEDIUM priority tickets
- Add "Available Tickets" section showing unassigned LOW/MEDIUM tickets
- Add "Claim Ticket" button for self-assignment
- Log activity: "{User} claimed ticket #{number}"
- Bonus score for taking initiative in claiming tickets

**Files to Modify:**
- `src/app/(agents)/junior/page.tsx`
- `src/app/api/tickets/route.ts` (add filter for unassigned)
- `src/components/dashboard/TicketCard.tsx` (add claim button variant)

---

### 1.2 Junior CS Can Handle LOW and MEDIUM Priority Without Senior Review
**Status:** ✅ NEEDS FIX  
**Current State:** Junior sends to "PENDING_REVIEW" status (line 140 in junior/page.tsx)  
**Required Change:**
- LOW and MEDIUM priority: Junior can directly resolve without senior review
- Remove "Request Senior Review" workflow for LOW/MEDIUM
- Button should say "Set as In Progress" → then "Mark as Resolved"

**Files to Modify:**
- `src/app/(agents)/junior/page.tsx`

---

### 1.3 Ticket Status Flow Changes - "In Progress" vs "Pending"
**Status:** ✅ NEEDS IMPLEMENTATION  
**Current State:** Status flow: OPEN → TRIAGE → IN_PROGRESS → etc.  
**Required Change:**
- Starting point should be "PENDING" not "IN_PROGRESS"
- Flow after assignment:
  1. Ticket assigned → status = "PENDING"
  2. User clicks "Set as In Progress" → status = "IN_PROGRESS"
  3. User clicks "Mark as Resolved" → status = "RESOLVED"
- Each action must be logged with timestamp

**Schema Change Required:**
```prisma
enum TicketStatus {
  OPEN
  TRIAGE
  PENDING      // NEW - replaces starting IN_PROGRESS
  IN_PROGRESS  // Now means actively being worked on
  RESOLVED
  CLOSED
  WITH_IT
  PAUSED_BY_CUSTOMER  // NEW - for long-term cases
}
```

**Files to Modify:**
- `prisma/schema.prisma`
- All page files using status
- API routes handling status changes

---

### 1.4 Medium-High Priority Can Be Escalated to IT by Both Senior AND Junior
**Status:** ✅ NEEDS VERIFICATION/FIX  
**Current State:** Only Senior can assign to IT  
**Required Change:**
- Both Senior AND Junior can escalate MEDIUM-HIGH priority tickets to IT
- Add "Escalate to IT" button in Junior dashboard for MEDIUM/HIGH tickets

**Files to Modify:**
- `src/app/(agents)/junior/page.tsx`

---

### 1.5 Resolve Button Requires Reason/Note
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- When clicking "Mark as Resolved", user MUST provide a reason
- The reason is logged in activity logs
- Option 1: Use existing Note system
- Option 2: Add dedicated "Resolution Note" field in confirmation modal

**Files to Modify:**
- `src/components/ui/ConfirmModal.tsx` (add optional note field)
- All pages calling resolve action

---

### 1.6 IT Assignment and Resolution Logging
**Status:** ✅ NEEDS ENHANCEMENT  
**Required Change:**
- When assigning to IT, log: "{User} assigned ticket #{number} to IT Support ({IT User Name})"
- When IT clicks "Mark as Fixed", they MUST add a note explaining the fix
- Log: "{IT User} marked ticket #{number} as fixed. Reason: {note}"

**Files to Modify:**
- `src/app/(agents)/it/page.tsx`
- `src/app/api/tickets/[id]/route.ts`

---

### 1.7 Pause/Resume Ticket for Long-Term Cases
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Add "Pause Ticket (Customer Hold)" button
- Ticket status = "PAUSED_BY_CUSTOMER"
- Paused tickets don't affect KPI negatively
- Add "Resume Ticket" button to reopen

**Schema Change:** Add `PAUSED_BY_CUSTOMER` status

**Files to Modify:**
- `prisma/schema.prisma`
- Senior/Junior dashboard pages
- API routes

---

## SECTION 2: KPI SCORING SYSTEM CHANGES

### 2.1 Remove Monthly Ticket Target, Use Percentage Instead
**Status:** ✅ NEEDS FIX  
**Current State:** Shows "XX/100 Target per Month"  
**Required Change:** Show percentage-based score instead

**Files to Modify:**
- `src/components/dashboard/ScoreCard.tsx`
- `src/app/api/stats/route.ts`
- `src/app/api/performance/route.ts`

---

### 2.2 Score Breakdown Formula
**Status:** ✅ NEEDS IMPLEMENTATION  
**Required Formula:**
- **Base Score:**
  - Tickets taken/claimed (initiative bonus)
  - Speed of resolution
- **SLA Penalties:**
  - LOW priority: Must resolve within 1 day (24 hours), else minus points
  - MEDIUM priority: Must resolve within 2 days (48 hours), else minus points
  - HIGH priority: Must resolve within 3 days (72 hours), else minus points
- **Bonus Points:**
  - Initiative (self-claiming tickets)

**Files to Modify:**
- `src/app/api/performance/route.ts`
- `src/app/api/stats/route.ts`

---

### 2.3 Display KPI Formula in Administrator Settings
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Add info section in Admin dashboard explaining KPI calculation
- Show SLA rules and penalty structure

**Files to Create:**
- `src/app/(agents)/admin/settings/page.tsx` OR add to existing admin page

---

### 2.4 IT Support KPI (Optional - NOT RECOMMENDED per user)
**Status:** ❌ SKIP (User preference: don't implement)
**Note:** User suggests NOT implementing IT KPI

---

## SECTION 3: UI/UX CHANGES

### 3.1 Chat Widget → Dedicated Chat Page
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Replace floating chat widget with dedicated `/chat` page
- Add "Chat" to sidebar navigation

**Files to Modify:**
- Create `src/app/(agents)/chat/page.tsx`
- `src/app/(agents)/layout.tsx` (sidebar)
- Remove or hide ChatWidget

---

### 3.2 Reduce Border Radius (Less Rounded Corners)
**Status:** ✅ UI FIX  
**Current State:** `rounded-[2rem]` used extensively  
**Required Change:** Use smaller radius like `rounded-xl` or `rounded-2xl`

**Files to Modify:**
- Global search and replace `rounded-[2rem]` → `rounded-2xl`
- Multiple component files

---

### 3.3 Admin Dashboard - System Activity Should Be Above Admin Actions
**Status:** ✅ UI FIX  
**Current State:** Admin Actions is at top, System Activity below  
**Required Change:** 
- Swap positions: System Activity on top
- Make System Activity larger/more prominent

**Files to Modify:**
- `src/app/(agents)/admin/page.tsx`

---

### 3.4 CS Dashboard - Ticket Details Should Be Above, CS Actions Below
**Status:** ✅ UI FIX (for Junior/Senior)  
**Current State:** Actions at top, details below  
**Required Change:** Flip the layout

**Files to Modify:**
- `src/app/(agents)/senior/page.tsx`
- `src/app/(agents)/junior/page.tsx`

---

### 3.5 Low Priority Ticket Background Should Be GREEN
**Status:** ✅ UI FIX  
**Current State:** Low priority uses blue (`bg-blue-50 text-blue-600`)  
**Required Change:** Use green (`bg-green-50 text-green-600`)

**Files to Modify:**
- `src/components/dashboard/TicketCard.tsx`
- Multiple pages with priority color logic

---

### 3.6 Create Ticket Modal Too Narrow - Make Wider
**Status:** ✅ UI FIX  
**Required Change:**
- Make modal wider (use 2-column layout)
- Email and Password fields side by side
- Reduce need for scrolling

**Files to Modify:**
- `src/components/modals/CreateTicketModal.tsx`
- Other modal components

---

### 3.7 Create Ticket - Customer Name → Customer Email (required)
**Status:** ✅ UI FIX  
**Required Change:**
- Customer Email should be REQUIRED field
- Keep Customer Name (future dropdown for company clients)

**Files to Modify:**
- `src/components/modals/CreateTicketModal.tsx`

---

### 3.8 Add User Modal - Avatar Upload Instead of URL
**Status:** 🆕 NEW FEATURE  
**Current State:** Avatar is a URL text field  
**Required Change:** Allow file upload for avatar

**Files to Modify:**
- `src/components/modals/AddUserModal.tsx`
- Create upload API endpoint

---

### 3.9 Status "In Progress" Color Inconsistency in Junior CS
**Status:** ✅ UI BUG  
**Required Change:** Ensure consistent color across all pages

**Files to Modify:**
- `src/app/(agents)/junior/page.tsx`
- `src/components/dashboard/TicketCard.tsx`

---

### 3.10 Senior CS vs Junior CS Dashboard Layout Inconsistency
**Status:** ✅ UI FIX  
**Current State:** 
- Senior CS: Only has "My Notes" panel
- Junior CS: Has full ticket details + My Activity
**Required Change:** Make consistent (both should show ticket details)

**Files to Modify:**
- `src/app/(agents)/senior/page.tsx`

---

### 3.11 Rename "My Activity" to "Logs"
**Status:** ✅ UI FIX  
**Required Change:**
- Rename "My Activity" → "Logs"
- Show format: "{User} {action} - {timestamp}"
- Example: "Dewi marked as done - 2:30 PM"

**Files to Modify:**
- `src/app/(agents)/junior/page.tsx`
- `src/app/(agents)/senior/page.tsx`

---

## SECTION 4: TICKETS PAGE IMPROVEMENTS

### 4.1 Remove TRIAGE Status (Same as OPEN)
**Status:** ✅ SCHEMA CHANGE  
**Required Change:** Remove TRIAGE, use OPEN only

**Files to Modify:**
- `prisma/schema.prisma`
- All files using TRIAGE status

---

### 4.2 Add "Latest Update" Column with Sort Arrows
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Add "Latest Update" column to tickets table
- Add ascending/descending sort arrows for Created and Latest Update columns

**Files to Modify:**
- All tickets page files (`admin/tickets`, `senior/tickets`, etc.)

---

### 4.3 Assigned To - Show Initials + Role Instead of Full Name
**Status:** ✅ UI FIX  
**Current State:** Shows "Rizky Pratama"  
**Required Change:** Show "RP" with role below

**Files to Modify:**
- Tickets page components

---

### 4.4 Long Subject Handling (Truncate vs Wrap)
**Status:** ✅ UI DECISION  
**Required Change:** Define behavior - truncate with "..." or wrap to new line

**Files to Modify:**
- Tickets table components

---

### 4.5 Create Ticket Subject → Dropdown Categories
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Subject should be a dropdown of predefined categories
- Categories are managed as master data
- Prepare for future AI auto-classification

**Schema Change Required:**
```prisma
model TicketCategory {
  id   String @id @default(uuid())
  name String @unique
  // ... other fields
}
```

**Files to Create/Modify:**
- `prisma/schema.prisma` (add Category model)
- `src/components/modals/CreateTicketModal.tsx`
- Admin page for managing categories

---

### 4.6 Filter for Stale Tickets (>3 Months Unresolved)
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Add filter/tab for tickets unresolved for >3 months
- Quick filter button

**Files to Modify:**
- Tickets page files

---

## SECTION 5: REPORTS & ANALYTICS IMPROVEMENTS

### 5.1 Date Range Picker (Custom Start/End Date)
**Status:** 🆕 NEW FEATURE  
**Current State:** Only fixed periods (this week, last month, etc.)  
**Required Change:**
- Add custom date range picker
- Apply to all report pages

**Files to Modify:**
- All report/analytics pages
- Create DateRangePicker component

---

### 5.2 Add "This Year" Option to Date Filters
**Status:** ✅ UI ENHANCEMENT  
**Required Change:** Add "This Year" to period selectors

**Files to Modify:**
- `src/app/(agents)/admin/reports/page.tsx`
- Other report pages

---

### 5.3 Reports - Show "Pending" Count
**Status:** ✅ UI ENHANCEMENT  
**Current State:** Shows Total, Resolved, Closed  
**Required Change:** Also show Pending/Open count

**Files to Modify:**
- `src/app/(agents)/admin/reports/page.tsx`

---

### 5.4 Admin Reports - Split Per Agent View
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Show individual CS performance cards
- Same layout as Senior CS reports page
- Include performance score for each agent

**Files to Modify:**
- `src/app/(agents)/admin/reports/page.tsx`

---

### 5.5 Add Reports Page to Junior CS
**Status:** 🆕 NEW FEATURE  
**Current State:** Only Senior CS has reports page  
**Required Change:** Clone reports functionality for Junior CS

**Files to Create:**
- `src/app/(agents)/junior/reports/page.tsx`

---

### 5.6 System Overview Date Picker
**Status:** ✅ UI ENHANCEMENT  
**Current State:** Shows "December 2025" (current month only)  
**Required Change:** Allow selecting this week, this month, custom range

**Files to Modify:**
- `src/app/(agents)/admin/page.tsx`

---

## SECTION 6: AI & ANALYTICS FEATURES

### 6.1 AI Priority Classification
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Add "Auto Set Priority by AI" button in Senior CS
- Use Gemini API for classification
- AI selects from predefined category dropdown

**Files to Create:**
- `src/app/api/ai/classify/route.ts`
- AI settings in admin

---

### 6.2 Weekly Best Performance Agent (AI Generated)
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Dashboard shows best performing CS this week
- AI generates summary like: "Dewi was most active this week"

**Files to Modify:**
- `src/app/(agents)/admin/page.tsx`

---

### 6.3 Problem Summary Analytics
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Show problem distribution: "70% tickets this week were password issues"
- Dashboard insight card

**Files to Modify:**
- `src/app/(agents)/admin/page.tsx`
- Create analytics API endpoint

---

### 6.4 Customer Analytics (Most Frequent Complainers)
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Analytics showing which customers submit most tickets
- What problems they report most

**Files to Modify:**
- `src/app/(agents)/admin/reports/page.tsx`
- `src/app/(agents)/senior/reports/page.tsx`

---

## SECTION 7: IT SUPPORT ENHANCEMENTS

### 7.1 IT Backlog/Todo Page
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Create internal todo list for IT team
- No customer attached
- Track future development tasks (e.g., "Implement biometric")

**Schema Change Required:**
```prisma
model ITBacklog {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  status      BacklogStatus @default(TODO)
  assignedTo  String?
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  // ... relations
}

enum BacklogStatus {
  TODO
  IN_PROGRESS
  DONE
}
```

**Files to Create:**
- `src/app/(agents)/it/backlog/page.tsx`
- `src/app/api/backlog/route.ts`

---

## SECTION 8: NOTIFICATIONS

### 8.1 Toast Notification for New Tickets
**Status:** ✅ ENHANCEMENT  
**Required Change:**
- Show toast when new ticket is created
- Make duration longer (don't miss while away)
- Add sound notification (optional)

**Files to Modify:**
- Implement polling or WebSocket for new ticket detection
- `react-hot-toast` configuration

---

### 8.2 Replace History Page with Notification History
**Status:** 🆕 NEW FEATURE  
**Required Change:**
- Convert history pages to notification center
- Add "Mark as Read" buttons
- Add notification bell icon with unread count in header

**Files to Create:**
- `src/app/(agents)/[role]/notifications/page.tsx`
- `src/components/dashboard/NotificationBell.tsx`
- `src/app/api/notifications/route.ts`

**Schema Change Required:**
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String   // 'NEW_TICKET', 'TICKET_ASSIGNED', etc.
  title     String
  message   String
  isRead    Boolean  @default(false)
  data      Json?    // Additional context
  createdAt DateTime @default(now())
  // ... relations
}
```

---

### 8.3 Audit Logs Search Bar
**Status:** 🆕 NEW FEATURE  
**Required Change:** Add search functionality to audit logs page

**Files to Modify:**
- `src/app/(agents)/admin/audit/page.tsx`

---

## SECTION 9: MOBILE RESPONSIVENESS

### 9.1 Mobile-Friendly Dashboard
**Status:** 🆕 NEW FEATURE (Optional - Client said "boleh kalau bisa")  
**Required Change:** Make dashboard responsive for mobile devices

**Files to Modify:**
- All page layouts
- Add responsive breakpoints

---

## 📊 PRIORITY MATRIX

### 🔴 HIGH PRIORITY (Core Functionality)
1. Junior CS Self-Assignment Feature
2. Ticket Status Flow Changes (PENDING → IN_PROGRESS)
3. Resolve Button Requires Reason
4. KPI Scoring System Changes
5. IT Assignment/Resolution Logging

### 🟠 MEDIUM PRIORITY (Important UX)
1. Chat Widget → Dedicated Page
2. Create Ticket Subject Dropdown Categories
3. Date Range Picker for Reports
4. Admin Reports Per Agent View
5. Junior CS Reports Page
6. Notification System

### 🟡 LOW PRIORITY (Nice to Have)
1. Reduce Border Radius
2. Layout Swaps (Actions vs Details)
3. Color Consistency Fixes
4. Mobile Responsiveness
5. AI Features

---

## 🗄️ DATABASE SCHEMA CHANGES REQUIRED

```prisma
// Add to schema.prisma

enum TicketStatus {
  OPEN
  PENDING          // NEW
  IN_PROGRESS
  RESOLVED
  CLOSED
  WITH_IT
  PAUSED_BY_CUSTOMER  // NEW
}

model TicketCategory {
  id        String   @id @default(uuid())
  name      String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  
  tickets   Ticket[]
  @@map("ticket_categories")
}

model ITBacklog {
  id          String       @id @default(uuid())
  title       String
  description String?      @db.Text
  status      BacklogStatus @default(TODO)
  assignedToId String?
  createdById  String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  @@map("it_backlog")
}

enum BacklogStatus {
  TODO
  IN_PROGRESS
  DONE
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String
  title     String
  message   String   @db.Text
  isRead    Boolean  @default(false)
  data      Json?
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  @@index([userId])
  @@map("notifications")
}

// Update Ticket model
model Ticket {
  // ... existing fields
  categoryId String? @map("category_id")
  pausedAt   DateTime? @map("paused_at")
  pauseReason String? @map("pause_reason")
  
  category   TicketCategory? @relation(fields: [categoryId], references: [id])
}
```

---

## ✅ IMPLEMENTATION ORDER

### Phase 1: Core Workflow (2-3 days)
1. [ ] Schema changes (status enum, category model)
2. [ ] Junior self-assignment
3. [ ] Status flow (PENDING → IN_PROGRESS → RESOLVED)
4. [ ] Resolve requires note
5. [ ] IT logging requirements

### Phase 2: KPI System (1-2 days)
1. [ ] New scoring formula
2. [ ] SLA penalties
3. [ ] Display KPI info in admin

### Phase 3: UI Fixes (1-2 days)
1. [ ] Layout swaps
2. [ ] Color fixes
3. [ ] Border radius
4. [ ] Modal improvements

### Phase 4: Reports Enhancement (1-2 days)
1. [ ] Date range picker
2. [ ] Per-agent reports
3. [ ] Junior reports page
4. [ ] Pending count

### Phase 5: New Features (2-3 days)
1. [ ] Chat page
2. [ ] Ticket categories dropdown
3. [ ] Notification system
4. [ ] IT Backlog

### Phase 6: AI Features (2-3 days)
1. [ ] AI classification
2. [ ] Best performer
3. [ ] Problem summary
4. [ ] Customer analytics

---

**Total Estimated Time: 10-15 days**
