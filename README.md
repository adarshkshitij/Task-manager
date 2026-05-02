# Team Task Manager

An enterprise-grade, full-stack assignment project built with `Next.js 16`, `Prisma`, `PostgreSQL`, and `NextAuth`. Designed with a premium, modern user interface, the application delivers robust project management capabilities, role-based access control, advanced analytics, and real-time operational insights.

## Core Features

- **Authentication & Security:** Secure email/password authentication via NextAuth with `bcryptjs`.
- **Role-Based Access Control:** Strict scoping for `ADMIN` and `MEMBER` roles across all APIs and UI views.
- **Project & Task Management:** Create projects, manage team members, and track tasks through their lifecycle (TODO, IN PROGRESS, DONE).
- **Advanced Dashboard (Cockpit):** A dynamic, data-dense overview displaying active work, velocity, compliance scores, due-soon milestones, and a real-time operational pulse.
- **Strategic Analytics & Reports:** Detailed performance metrics, completion velocity, workspace operational distribution, and individual user performance analytics.
- **Global Search:** Interactive command-palette style search for rapidly jumping to projects and tasks.
- **Activity & Notification System:** Comprehensive activity logs and interactive notification feed for seamless team coordination.
- **Responsive & Premium UI:** Crafted using `Tailwind CSS 4` and `Lucide React` with micro-animations, glassmorphism, and a polished enterprise aesthetic.

## Tech Stack

- **Framework:** `Next.js 16` (App Router)
- **Language:** `TypeScript`
- **Styling:** `Tailwind CSS 4`
- **Database ORM:** `Prisma 7`
- **Database:** `PostgreSQL`
- **Authentication:** `NextAuth`
- **Validation:** `Zod`
- **Testing:** `Playwright`

## Local Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Configure Environment:**

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

*(PowerShell alternative: `Copy-Item .env.example .env`)*

Ensure your `.env` contains:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/team_task_manager?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-long-random-secret"
```

3. **Initialize Database:**

Generate the Prisma client and push the schema:

```bash
npm run db:generate
npm run db:push
```

4. **Seed Demo Data:**

Populate the database with the initial demo data (users, projects, tasks):

```bash
npm run db:seed
```

5. **Start Development Server:**

```bash
npm run dev
```

6. **Access the App:** Open `http://localhost:3000`

## Demo Credentials

- **Admin Account:** `admin@example.com` / `Admin@123`
- **Member Account:** `member@example.com` / `Member@123`

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Generate Prisma client and build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run test` - Run Playwright smoke tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push Prisma schema to the database
- `npm run db:seed` - Seed demo data

## Role Permissions

### Admin
- Full access to all projects and tasks.
- Create, edit, and delete projects.
- Manage project memberships (invite/remove).
- Assign, update, and delete tasks.
- View global strategic analytics and activity logs.
- Manage workspace settings.

### Member
- Access limited to assigned projects.
- View assigned tasks and update task status.
- Access personal workload and performance analytics.
- View team directory and project member lists.

## Railway Deployment

This project is optimized for deployment on Railway:

1. Create a PostgreSQL database in Railway.
2. Create a new Railway service connected to your GitHub repository.
3. Add the following environment variables to your service:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (Your production URL)
   - `NEXTAUTH_SECRET`
4. The build process automatically handles Prisma generation (`npm run build` includes `prisma generate`).
5. Run `npm run db:push` (either via a deploy script or manually) to migrate the schema on the production database.
6. Verify deployment by logging in and checking the `/api/health` endpoint.

## Project Structure

- `src/app` - Next.js App Router pages, layouts, and API route handlers
- `src/components` - Reusable UI components, forms, modals, and layouts
- `src/lib` - Core utilities, Prisma client, NextAuth configuration, and shared logic
- `prisma` - Database schema definitions and database seeding scripts
