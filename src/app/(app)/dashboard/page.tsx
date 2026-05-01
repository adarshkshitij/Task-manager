import { addDays } from "date-fns";
import { Role, TaskStatus } from "@prisma/client";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { StatsCard } from "@/components/stats-card";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatDate, getDueLabel, getStatusClasses } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  const now = new Date();
  const dueSoonCutoff = addDays(now, 3);

  const projectWhere =
    session.user.role === Role.ADMIN
      ? {}
      : {
          members: {
            some: { userId: session.user.id },
          },
        };

  const taskWhere =
    session.user.role === Role.ADMIN
      ? {}
      : {
          assignedToId: session.user.id,
        };

  const [projectCount, totalTasks, completedTasks, inProgressTasks, overdueTasks, dueSoonTasks, attentionTasks] =
    await Promise.all([
      prisma.project.count({ where: projectWhere }),
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: TaskStatus.DONE } }),
      prisma.task.count({ where: { ...taskWhere, status: TaskStatus.IN_PROGRESS } }),
      prisma.task.count({
        where: {
          ...taskWhere,
          dueDate: { lt: now },
          status: { not: TaskStatus.DONE },
        },
      }),
      prisma.task.findMany({
        where: {
          ...taskWhere,
          dueDate: {
            gte: now,
            lte: dueSoonCutoff,
          },
          status: { not: TaskStatus.DONE },
        },
        include: {
          project: {
            select: { id: true, name: true },
          },
          assignedTo: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 4,
      }),
      prisma.task.findMany({
        where: {
          ...taskWhere,
          OR: [
            {
              dueDate: { lt: now },
              status: { not: TaskStatus.DONE },
            },
            {
              status: TaskStatus.IN_PROGRESS,
            },
          ],
        },
        include: {
          project: {
            select: { id: true, name: true },
          },
          assignedTo: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
        take: 5,
      }),
    ]);

  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const roleHeadline =
    session.user.role === Role.ADMIN
      ? "Monitor team delivery, unblock execution, and keep projects moving."
      : "Stay on top of your assignments and show progress clearly.";
  const roleSubcopy =
    session.user.role === Role.ADMIN
      ? "Your cockpit highlights throughput, due-soon work, and tasks that need intervention before they slip."
      : "Your cockpit surfaces your due-soon work, in-progress items, and anything that needs immediate attention.";

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-amber-600">Demo cockpit</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{roleHeadline}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{roleSubcopy}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">Completion rate</p>
              <p className="mt-3 text-4xl font-semibold">{completionRate}%</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-amber-300 transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-300">
                {completedTasks} of {totalTasks} tasks are completed.
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Due soon</p>
              <p className="mt-3 text-4xl font-semibold text-slate-950">{dueSoonTasks.length}</p>
              <p className="mt-3 text-xs text-slate-500">
                Items due in the next 3 days that still need action.
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-rose-50/70 p-5">
              <p className="text-sm text-rose-600">Needs attention</p>
              <p className="mt-3 text-4xl font-semibold text-slate-950">{attentionTasks.length}</p>
              <p className="mt-3 text-xs text-slate-500">
                Overdue or in-progress work to highlight during the demo.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/60 bg-slate-950 p-6 text-white shadow-[0_24px_70px_-32px_rgba(15,23,42,0.55)]">
          <h2 className="text-xl font-semibold">Selection checklist</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            <li>Lead with the live app, not the code</li>
            <li>Show one admin flow and one member flow without hesitation</li>
            <li>Use the seeded credentials and seeded story for consistency</li>
            <li>Point out role guards, validations, and overdue tracking clearly</li>
            <li>End with the Railway URL, README, and GitHub repo</li>
          </ul>
          <div className="mt-8 rounded-[24px] bg-white/10 p-4">
            <p className="text-sm font-semibold text-amber-300">Demo credentials after seeding</p>
            <p className="mt-2 text-sm text-slate-200">Admin: `admin@example.com` / `Admin@123`</p>
            <p className="mt-1 text-sm text-slate-200">Member: `member@example.com` / `Member@123`</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard label="Projects" value={projectCount} accent="bg-sky-100 text-sky-700" />
        <StatsCard label="Total Tasks" value={totalTasks} accent="bg-slate-100 text-slate-700" />
        <StatsCard label="Completed" value={completedTasks} accent="bg-emerald-100 text-emerald-700" />
        <StatsCard label="In Progress" value={inProgressTasks} accent="bg-amber-100 text-amber-700" />
        <StatsCard label="Overdue" value={overdueTasks} accent="bg-rose-100 text-rose-700" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Due soon</h2>
              <p className="mt-1 text-sm text-slate-600">
                A focused list of tasks due in the next 3 days.
              </p>
            </div>
            <Link href="/tasks" className="text-sm font-semibold text-slate-900">
              Open tasks
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {dueSoonTasks.length ? (
              dueSoonTasks.map((task) => (
                <TaskPreviewCard
                  key={task.id}
                  title={task.title}
                  projectName={task.project.name}
                  assignee={task.assignedTo.name}
                  status={task.status}
                  dueDate={task.dueDate}
                />
              ))
            ) : (
              <EmptyState
                title="No due-soon tasks"
                description="This is a good signal in a demo because nothing urgent is at risk right now."
              />
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Needs attention</h2>
              <p className="mt-1 text-sm text-slate-600">
                Overdue or actively moving tasks to discuss during review.
              </p>
            </div>
            <Link href="/tasks?status=IN_PROGRESS" className="text-sm font-semibold text-slate-900">
              View in progress
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {attentionTasks.length ? (
              attentionTasks.map((task) => (
                <TaskPreviewCard
                  key={task.id}
                  title={task.title}
                  projectName={task.project.name}
                  assignee={task.assignedTo.name}
                  status={task.status}
                  dueDate={task.dueDate}
                />
              ))
            ) : (
              <EmptyState
                title="No attention items"
                description="Use this during the demo to show that the current workload is under control."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function TaskPreviewCard({
  title,
  projectName,
  assignee,
  status,
  dueDate,
}: {
  title: string;
  projectName: string;
  assignee: string;
  status: TaskStatus;
  dueDate: Date | null;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(status)}`}>
              {status.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{projectName}</p>
          <p className="mt-1 text-sm text-slate-500">
            Assigned to {assignee} • {formatDate(dueDate)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            dueDate && dueDate < new Date() && status !== TaskStatus.DONE
              ? "bg-rose-100 text-rose-700"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          {getDueLabel(dueDate)}
        </span>
      </div>
    </div>
  );
}
