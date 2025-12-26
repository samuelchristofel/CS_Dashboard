# KPI Rating System

> **HelpDesk Agent Performance Metrics**  
> **Version:** 1.0  
> **Last Updated:** December 26, 2024

---

## 📋 Overview

This document defines the Key Performance Indicators (KPIs) for measuring agent performance in the HelpDesk system. Each role has specific metrics based on their responsibilities in the ticket lifecycle.

---

## 🔄 Ticket Lifecycle Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TICKET LIFECYCLE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   CUSTOMER   │
    │   REQUEST    │
    └──────┬───────┘
           │
           ▼
┌─────────────────────┐
│      SENIOR CS      │◄──────────────────────────────────────────┐
│  Creates Ticket     │                                           │
│  (status: OPEN)     │                                           │
└──────────┬──────────┘                                           │
           │                                                      │
           ▼                                                      │
    ┌──────────────┐                                             │
    │   TRIAGE     │                                             │
    │   Decision   │                                             │
    └──────┬───────┘                                             │
           │                                                      │
     ┌─────┴─────┐                                               │
     │           │                                               │
     ▼           ▼                                               │
┌─────────┐  ┌──────────┐                                       │
│ Simple  │  │ Complex/ │                                       │
│ Issue   │  │Technical │                                       │
└────┬────┘  └────┬─────┘                                       │
     │            │                                              │
     ▼            ▼                                              │
┌──────────┐  ┌──────────────┐                                  │
│ JUNIOR   │  │    IT        │                                  │
│   CS     │  │  SUPPORT     │                                  │
│          │  │              │                                  │
│ Assigned │  │  Escalated   │                                  │
│ by Senior│  │  (WITH_IT)   │                                  │
└────┬─────┘  └──────┬───────┘                                  │
     │               │                                          │
     │ Works on      │ Fixes technical                          │
     │ ticket        │ issue                                    │
     │               │                                          │
     ▼               ▼                                          │
┌──────────┐  ┌──────────────┐                                  │
│ Mark as  │  │  Mark as     │                                  │
│  DONE    │  │   FIXED      │                                  │
│(PENDING  │  │ (RESOLVED)   │                                  │
│ REVIEW)  │  └──────┬───────┘                                  │
└────┬─────┘         │                                          │
     │               │                                          │
     └───────────────┴──────────────────────────────────────────┤
                                                                │
                              ▼                                 │
                    ┌─────────────────┐                         │
                    │    SENIOR CS    │                         │
                    │  Reviews Work   │                         │
                    └────────┬────────┘                         │
                             │                                  │
                      ┌──────┴──────┐                          │
                      │             │                          │
                      ▼             ▼                          │
                 ┌────────┐   ┌──────────┐                     │
                 │Approved│   │ Rejected │─────────────────────┘
                 └───┬────┘   └──────────┘   (Back to assignee)
                     │
                     ▼
              ┌─────────────┐
              │   CLOSED    │
              │  (by Senior)│
              └─────────────┘
```

---

## 👔 Senior CS KPIs

**Role:** Creates tickets, assigns to Junior/IT, reviews work, closes tickets

### Metrics

| Metric | Description | Formula | Target |
|--------|-------------|---------|--------|
| **Tickets Created** | Number of tickets logged | Count per period | - |
| **Tickets Closed** | Number of tickets finalized | Count per period | - |
| **Review Turnaround** | Time to review completed tickets | `reviewed_at - pending_review_at` | < 2 hours |
| **Assignment Rate** | % of tickets assigned vs self-handled | `(Assigned / Total) × 100` | 60-70% |

### Score Calculation

```
Senior Score = (Tickets Closed × 2) + (Quick Reviews × 1)

Where:
- Tickets Closed = All tickets closed by this Senior
- Quick Reviews = Tickets reviewed within target time
```

---

## 🌱 Junior CS KPIs

**Role:** Works on assigned tickets, marks as done for review

### Metrics

| Metric | Description | Formula | Target |
|--------|-------------|---------|--------|
| **Tickets Completed** | Tickets marked as Done | Count per period | 30/month |
| **Avg Handling Time** | Time from assignment to completion | `marked_done_at - assigned_at` | Varies by priority |
| **Completion Rate** | % of assigned tickets completed | `(Completed / Assigned) × 100` | 90%+ |
| **Rejection Rate** | % of work sent back by Senior | `(Rejected / Submitted) × 100` | < 5% |

### Time Targets by Priority

| Priority | Target Handling Time |
|----------|---------------------|
| HIGH | 4 hours |
| MEDIUM | 24 hours |
| LOW | 48 hours |

### Score Calculation

```
Junior Score = Base Score + Speed Bonus + Quality Bonus

Where:
- Base Score = (Completed Tickets / Target) × 60
- Speed Bonus = (Tickets completed under target time / Total) × 25
- Quality Bonus = (100 - Rejection Rate) × 0.15

Maximum Score: 100
```

**Example:**
```
Completed: 28 tickets (Target: 30)
Under target time: 22 tickets
Rejection Rate: 3%

Base Score = (28/30) × 60 = 56
Speed Bonus = (22/28) × 25 = 19.6
Quality Bonus = (100 - 3) × 0.15 = 14.6

Total Score = 56 + 19.6 + 14.6 = 90.2
```

---

## 🔧 IT Support KPIs

**Role:** Handles technical escalations, fixes IT issues

### Metrics

| Metric | Description | Formula | Target |
|--------|-------------|---------|--------|
| **Tickets Resolved** | Technical tickets fixed | Count per period | - |
| **Avg Fix Time** | Time from escalation to fix | `fixed_at - escalated_at` | < 2 hours |
| **Escalation Return** | Tickets returned as "not IT issue" | `(Returned / Received) × 100` | < 10% |

### Score Calculation

```
IT Score = Tickets Resolved × 3

Notes:
- IT is scored differently (per ticket, not rate-based)
- Complex technical issues count more
```

---

## 👑 Admin View

Admin can see performance of all agents:

### Team Performance Table

| Agent | Role | Assigned | Completed | Avg Time | Score | Rating |
|-------|------|----------|-----------|----------|-------|--------|
| Jay Won | Senior | 45 | 42 | 1.5h | 95 | ⭐ Excellent |
| Himari | Junior | 32 | 28 | 18h | 72 | 📈 Good |
| Andi R. | Junior | 30 | 28 | 14h | 88 | ✅ Great |
| Budi | IT | 15 | 14 | 45m | 42 | 🔧 On Track |

### Rating Thresholds

| Score Range | Rating | Badge |
|-------------|--------|-------|
| 90-100 | Excellent | ⭐ |
| 80-89 | Great | ✅ |
| 70-79 | Good | 📈 |
| 60-69 | Needs Improvement | ⚠️ |
| < 60 | At Risk | 🔴 |

---

## 🗃️ Database Requirements

### New Column Needed

```sql
ALTER TABLE tickets ADD COLUMN assigned_at TIMESTAMPTZ;
```

### Timestamps Used

| Column | When Set | Used For |
|--------|----------|----------|
| `created_at` | Ticket creation | Response time |
| `assigned_at` | When assigned to agent | Handling time start |
| `updated_at` | Any status change | Activity tracking |
| `closed_at` | When ticket closed | Resolution time end |

---

## 📊 API Endpoint

### GET `/api/performance`

Returns agent performance data:

```json
{
  "agents": [
    {
      "id": "uuid",
      "name": "Himari",
      "role": "junior",
      "metrics": {
        "assigned": 32,
        "completed": 28,
        "avgHandlingTime": "18h",
        "completionRate": 87.5,
        "score": 72
      }
    }
  ],
  "teamStats": {
    "totalResolved": 112,
    "avgResolutionTime": "4.2h",
    "overallScore": 81
  }
}
```

---

## 📝 Implementation Checklist

- [ ] Add `assigned_at` column to tickets table
- [ ] Update ticket assignment API to set `assigned_at`
- [ ] Create `/api/performance` endpoint
- [ ] Wire up Admin Reports page to real data
- [ ] Add score display to individual dashboards
- [ ] Calculate and display team average

---

## 🔮 Future Enhancements

- [ ] Monthly/Weekly score trends
- [ ] Leaderboard view
- [ ] Individual performance charts
- [ ] Export performance reports
- [ ] Email notifications for low scores
