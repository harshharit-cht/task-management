# TaskFlow — Team Task Manager

A full-stack project & task management app with role-based access control.

## Live Demo
🔗 [team-task-manager.up.railway.app](https://task-management-production-2a0d.up.railway.app)

**Demo accounts (password: `password123`)**
| Email | Role |
|---|---|
| arjun@example.com | Admin — Website Redesign |
| priya@example.com | Admin — Mobile App v2 |
| rohan@example.com | Member |

## Tech Stack
- **Framework** — Next.js 14 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS + shadcn/ui
- **Auth** — NextAuth.js v5 (JWT)
- **ORM** — Prisma
- **Database** — PostgreSQL
- **Data fetching** — TanStack Query
- **Notifications** — Sonner
- **Deployment** — Railway

## Features
- 🔐 Authentication (Signup / Login)
- 🏗️ Project creation and management
- 👥 Team management with role-based access (Admin / Member)
- ✅ Task creation, assignment, status tracking
- 📋 Kanban board (Todo → In Progress → In Review → Done)
- 🏷️ Task priorities, due dates, tags, comments
- 📊 Dashboard with stats, overdue alerts, recent activity
- 🛡️ RBAC — admins manage members & settings, members manage tasks

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL

### Setup

\`\`\`bash
# Clone the repo
git clone https://github.com/your-username/team-task-manager
cd team-task-manager

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your DATABASE_URL and NEXTAUTH_SECRET

# Run migrations and seed
npx prisma migrate dev
npm run db:seed

# Start dev server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## API Routes

| Method | Route | Role |
|---|---|---|
| GET/POST | `/api/projects` | Auth |
| GET/PATCH/DELETE | `/api/projects/[id]` | Member / Admin |
| GET/POST | `/api/projects/[id]/members` | Member / Admin |
| PATCH/DELETE | `/api/projects/[id]/members/[mid]` | Admin |
| GET/POST | `/api/projects/[id]/tasks` | Member |
| GET/PATCH/DELETE | `/api/projects/[id]/tasks/[tid]` | Member / Admin |
| GET/POST | `/api/projects/[id]/tasks/[tid]/comments` | Member |
| GET | `/api/dashboard` | Auth |

## Deployment

Deployed on [Railway](https://railway.app) with a managed PostgreSQL instance.