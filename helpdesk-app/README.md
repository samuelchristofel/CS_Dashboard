# Vastel Helpdesk Application

A modern helpdesk ticketing system built with Next.js 16, React 19, TypeScript, and MySQL.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Database:** MySQL + Prisma ORM
- **Charts:** Recharts

## Getting Started

### Prerequisites

1. **Node.js 18+** installed
2. **MySQL** running (via XAMPP, WAMP, Laragon, or standalone)
3. Create a database named `helpdesk_db` in phpMyAdmin

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env` and update with your MySQL credentials:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/helpdesk_db"
   ```

3. **Create database tables:**
   ```bash
   npx prisma db push
   ```

4. **Seed sample data:**
   ```bash
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | samuel@vastel.co.id | admin123 |
| Senior CS | dewi@vastel.co.id | senior123 |
| Junior CS | siti@vastel.co.id | junior123 |
| IT Support | bambang@vastel.co.id | it123 |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:seed` | Seed database with sample data |
| `npx prisma studio` | Open Prisma database browser |

## Project Structure

```
src/
├── app/
│   ├── (agents)/      # Agent dashboards (junior, senior)
│   ├── admin/         # Admin dashboard
│   ├── api/           # API routes
│   └── login/         # Login page
├── components/
│   ├── chat/          # Chat widget
│   ├── dashboard/     # Dashboard components
│   ├── modals/        # Modal dialogs
│   └── ui/            # UI primitives
├── lib/
│   └── db.ts          # Prisma client
└── types/             # TypeScript types
```

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/login` | POST | User authentication |
| `/api/users` | GET, POST | User management |
| `/api/users/[id]` | GET, PATCH, DELETE | Single user operations |
| `/api/tickets` | GET, POST | Ticket management |
| `/api/tickets/[id]` | GET, PATCH, DELETE | Single ticket operations |
| `/api/tickets/[id]/notes` | GET, POST, PATCH | Ticket notes |
| `/api/stats` | GET | Dashboard statistics |
| `/api/activities` | GET | Activity log |
| `/api/performance` | GET | Agent performance metrics |

## License

Private - Vastel Indonesia
