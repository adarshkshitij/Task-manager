import { Role, TaskStatus, TaskPriority } from "@prisma/client";
import Link from "next/link";
import { DeleteTaskButton } from "@/components/delete-task-button";
import { EmptyState } from "@/components/empty-state";
import { TaskStatusForm } from "@/components/task-status-form";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatDate, getDueLabel, getStatusClasses, getPriorityClasses } from "@/lib/utils";
import { 
  LayoutList, 
  Calendar, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  Plus
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; filter?: string }>;
}) {
  const session = await requireSession();
  const { status, filter } = await searchParams;

  const where = {
    ...(session.user.role === Role.ADMIN
      ? {}
      : {
          OR: [
            { assignedToId: session.user.id },
            { createdById: session.user.id },
          ],
        }),
    ...(status && status !== "ALL" ? { status: status as TaskStatus } : {}),
    ...(filter === "mine" ? { assignedToId: session.user.id } : {}),
    ...(filter === "overdue" ? { 
      dueDate: { lt: new Date() },
      status: { not: TaskStatus.DONE }
    } : {}),
    ...(filter === "high" ? { priority: TaskPriority.HIGH } : {}),
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

  const totalTasks = tasks.length;
  const overdueCount = tasks.filter(
    (t) => t.dueDate && t.dueDate < new Date() && t.status !== TaskStatus.DONE
  ).length;
  const completedCount = tasks.filter((t) => t.status === TaskStatus.DONE).length;

  const filters = ["ALL", "TODO", "IN_PROGRESS", "DONE"];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Premium Page Header */}
      <header className="relative overflow-hidden rounded-[32px] bg-white border border-slate-200 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
              <span>Operations</span>
              <span className="text-slate-300">/</span>
              <span className="text-indigo-600">Task Registry</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Task Registry</h1>
            <p className="mt-3 text-lg text-slate-500 max-w-2xl font-medium">
              {session.user.role === Role.ADMIN
                ? "Comprehensive overview of operational throughput across the entire workspace."
                : "Priority list of your assigned deliverables and upcoming deadlines."}
            </p>
          </div>
          
          {/* Actions & Summary */}
          <div className="flex flex-col sm:flex-row items-center gap-6 self-start lg:self-center">
            <Link 
              href="/tasks/new"
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Initiate Mission
            </Link>

            <div className="h-10 w-px bg-slate-200 hidden sm:block" />

            {/* Summary stats container */}
            <div className="flex items-center gap-6 rounded-2xl bg-slate-50 px-6 py-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm border border-slate-100">
                  <LayoutList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                  <p className="text-xl font-black text-slate-900">{totalTasks}</p>
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm border border-slate-100">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overdue</p>
                  <p className="text-xl font-black text-slate-900">{overdueCount}</p>
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm border border-slate-100">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Done</p>
                  <p className="text-xl font-black text-slate-900">{completedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100/50 p-1 ring-1 ring-slate-200/60 w-max">
        {filters.map((filter) => {
          const isActive = (status ?? "ALL") === filter;
          return (
            <Link
              key={filter}
              href={filter === "ALL" ? "/tasks" : `/tasks?status=${filter}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:bg-slate-200/30 hover:text-slate-700"
              }`}
            >
              {filter.replaceAll("_", " ")}
            </Link>
          );
        })}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-4">
        {tasks.length ? (
          tasks.map((task) => {
            const canEdit =
              session.user.role === Role.ADMIN || 
              task.assignedTo.id === session.user.id ||
              task.createdById === session.user.id;
            const isOverdue =
              task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.DONE;

            return (
              <div
                key={task.id}
                className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
                  isOverdue ? "ring-1 ring-rose-200" : "ring-1 ring-slate-200"
                }`}
              >
                {isOverdue && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-rose-500" />
                )}

                <div className="flex flex-col gap-3 sm:w-2/3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusClasses(
                        task.status
                      )}`}
                    >
                      {task.status.replaceAll("_", " ")}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getPriorityClasses(task.priority)}`}>
                      {task.priority} Priority
                    </span>
                    {isOverdue && (
                      <span className="flex items-center gap-1 rounded-md border border-rose-100 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                        <AlertCircle className="h-3 w-3" />
                        Overdue
                      </span>
                    )}
                  </div>

                  <p className="line-clamp-2 text-sm text-slate-500">
                    {task.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <LayoutList className="h-3.5 w-3.5 text-slate-400" />
                      {task.project.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                        {task.assignedTo.name.charAt(0)}
                      </div>
                      {task.assignedTo.name}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-4 sm:w-1/3 sm:items-end">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div className="flex flex-col sm:items-end">
                      <time
                        dateTime={task.dueDate?.toISOString() ?? ""}
                        className={isOverdue ? "font-semibold text-rose-600" : "font-medium"}
                      >
                        {formatDate(task.dueDate)}
                      </time>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">
                        {getDueLabel(task.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <TaskStatusForm taskId={task.id} status={task.status} disabled={!canEdit} />
                    {session.user.role === Role.ADMIN || task.createdById === session.user.id ? (
                      <DeleteTaskButton taskId={task.id} />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12">
            <EmptyState
              title="No tasks match this filter right now."
              description="Try selecting a different filter or create new tasks inside a project."
            />
          </div>
        )}
      </div>
    </div>
  );
}
