import { Role, TaskStatus } from "@prisma/client";
import Link from "next/link";
import { DeleteTaskButton } from "@/components/delete-task-button";
import { EmptyState } from "@/components/empty-state";
import { TaskStatusForm } from "@/components/task-status-form";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatDate, getDueLabel, getStatusClasses } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireSession();
  const { status } = await searchParams;

  const where = {
    ...(session.user.role === Role.ADMIN ? {} : { assignedToId: session.user.id }),
    ...(status && status !== "ALL" ? { status: status as TaskStatus } : {}),
  };

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: {
        select: { id: true, name: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  const filters = ["ALL", "TODO", "IN_PROGRESS", "DONE"];

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Tasks</h2>
          <p className="mt-1 text-sm text-slate-600">
            {session.user.role === Role.ADMIN
              ? "Track progress across all projects."
              : "Manage the tasks currently assigned to you."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={filter === "ALL" ? "/tasks" : `/tasks?status=${filter}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                (status ?? "ALL") === filter
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {filter.replaceAll("_", " ")}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {tasks.length ? (
          tasks.map((task) => {
            const canEdit = session.user.role === Role.ADMIN || task.assignedTo.id === session.user.id;
            const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.DONE;

            return (
              <div
                key={task.id}
                className={`rounded-[24px] border p-5 ${isOverdue ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-slate-50"}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-950">{task.title}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(task.status)}`}>
                        {task.status.replaceAll("_", " ")}
                      </span>
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {task.priority}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {task.description || "No description added for this task."}
                    </p>
                    <p className="mt-3 text-sm text-slate-500">
                      Project: {task.project.name} • Assigned to {task.assignedTo.name}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        isOverdue ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {getDueLabel(task.dueDate)}
                    </span>
                    <p className="text-xs text-slate-500">Due {formatDate(task.dueDate)}</p>
                    <TaskStatusForm taskId={task.id} status={task.status} disabled={!canEdit} />
                    {session.user.role === Role.ADMIN ? <DeleteTaskButton taskId={task.id} /> : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No tasks found"
            description="Try another filter or create tasks inside a project to see them here."
          />
        )}
      </div>
    </div>
  );
}
