# Team Task Manager

Full-stack assignment project built with `Next.js`, `Prisma`, `PostgreSQL`, and `NextAuth`. The app supports role-based access for `Admin` and `Member`, including project management, task assignment, progress tracking, and overdue visibility.

## Features

- Email/password signup and login
- Role-based access control for `ADMIN` and `MEMBER`
- Project creation and project listing
- Team member assignment to projects
- Task creation, assignment, and status updates
- Admin task deletion
- Admin member removal with server-side safety checks
- Dashboard cards for task/project counts
- Demo-focused dashboard cockpit with completion, due-soon, and attention views
- Overdue task highlighting
- REST-style route handlers under `/api`
- Health-check endpoint at `/api/health`
- Railway-ready PostgreSQL configuration

## Tech Stack

- `Next.js 16` App Router
- `TypeScript`
- `Tailwind CSS 4`
- `Prisma 7`
- `PostgreSQL`
- `NextAuth` credentials provider
- `Zod`
- `bcryptjs`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

Required variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/team_task_manager?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-long-random-secret"
```

3. Generate the Prisma client:

```bash
npm run db:generate
```

4. Push the schema to your database:

```bash
npm run db:push
```

5. Seed demo data:

```bash
npm run db:seed
```

6. Start the development server:

```bash
npm run dev
```

7. Open `http://localhost:3000`

## Demo Credentials

- Admin: `admin@example.com` / `Admin@123`
- Member: `member@example.com` / `Member@123`

## Available Scripts

- `npm run dev` - start local development
- `npm run build` - production build
- `npm run lint` - run ESLint
- `npm run test` - run Playwright smoke tests
- `npm run test:e2e` - run Playwright smoke tests
- `npm run db:generate` - generate Prisma client
- `npm run db:push` - push schema to database
- `npm run db:seed` - seed demo users, project, and task

## Quick Verification

After starting the app and seeding the database, verify:

- `GET /api/health` returns `status: "ok"`
- login works for both seeded accounts
- admin can create a project, add a member, and create a task
- member can update task status

Run the smoke suite:

```bash
npm run test
```

Important:

- the Playwright smoke suite expects a real `.env` file
- the database schema must already be pushed
- the demo data must already be seeded

## Role Permissions

### Admin

- Create projects
- Add project members
- Remove project members when they have no tasks assigned in that project
- Create and assign tasks
- Update any task
- Delete tasks
- View all dashboard stats

### Member

- View projects they belong to
- View assigned tasks
- Update status on their own tasks
- View their personal workload dashboard

## API Summary

### Auth

- `POST /api/auth/register`
- `GET/POST /api/auth/[...nextauth]`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Dashboard

- `GET /api/dashboard`

### Health

- `GET /api/health`

## Railway Deployment

1. Create a PostgreSQL database in Railway.
2. Create a new Railway service for the Next.js app.
3. Add these environment variables in Railway:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
4. Run:

```bash
npm run db:generate
npm run db:push
npm run build
```

5. Deploy and verify:
   - signup/login works
   - seeded or created data loads
   - dashboard, projects, and tasks are accessible
   - `/api/health` returns `status: "ok"`
   - `npm run test` passes against the live or staging target if configured

## Current Status

Implemented in the app:

- Auth flow and protected pages
- Admin/member role separation
- Project CRUD surface required by the assignment
- Member assignment and removal flow
- Task creation, tracking, filtering, status changes, and overdue highlighting
- Demo cockpit dashboard polish
- Playwright smoke coverage for critical role-based flows
- Demo seed data and build-ready configuration

Still external/manual:

- Create a real PostgreSQL database
- Add production env vars
- Run Railway deployment
- Record the demo video
- Push the final repo to GitHub

## Submission Checklist

- Live deployed Railway URL
- GitHub repository
- README
- 2-5 minute demo video

## Project Structure

- `src/app` - App Router pages and API route handlers
- `src/components` - UI components and client forms
- `src/lib` - Prisma, auth, validation, and utility helpers
- `prisma` - schema and seed script
