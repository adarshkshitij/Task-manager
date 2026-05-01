import { Role, TaskStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { AddMemberForm } from "@/components/add-member-form";
import { CreateTaskForm } from "@/components/create-task-form";
import { DeleteTaskButton } from "@/components/delete-task-button";
import { EmptyState } from "@/components/empty-state";
import { RemoveMemberButton } from "@/components/remove-member-button";
import { TaskStatusForm } from "@/components/task-status-form";
import { canAccessProject } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatDate, getDueLabel, getStatusClasses } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const allowed = await canAccessProject(session.user.id, session.user.role as Role, id);

  if (!allowed) {
    redirect("/projects");
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      tasks: {
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!project) {
    notFound();
  }

  const allUsers =
    session.user.role === Role.ADMIN ? await prisma.user.findMany({ orderBy: { name: "asc" } }) : [];
  const projectMemberIds = new Set(project.members.map((member) => member.user.id));
  const availableUsers = allUsers.filter((user) => !projectMemberIds.has(user.id));

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-amber-600">Project detail</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-950">{project.name}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              {project.description || "No description added yet for this project."}
            </p>
          </div>
          <div className="rounded-[24px] bg-slate-950 px-5 py-4 text-sm text-slate-200">
            <p>Created by {project.createdBy.name}</p>
            <p className="mt-1">{project.members.length} members • {project.tasks.length} tasks</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]">
            <h3 className="text-xl font-semibold text-slate-950">Team members</h3>
            <div className="mt-4 space-y-3">
              {project.members.map((member) => (
                <div key={member.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{member.user.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{member.user.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                          {member.user.role}
                        </span>
                        {project.createdById === member.user.id ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            Creator
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {session.user.role === Role.ADMIN && project.createdById !== member.user.id ? (
                      <RemoveMemberButton projectId={project.id} userId={member.user.id} />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {session.user.role === Role.ADMIN ? (
            <>
              <AddMemberForm projectId={project.id} users={availableUsers} />
              <CreateTaskForm
                projectId={project.id}
                members={project.members.map((member) => ({
                  id: member.user.id,
                  name: member.user.name,
                  email: member.user.email,
                }))}
              />
            </>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]">
          <h3 className="text-xl font-semibold text-slate-950">Project tasks</h3>
          <div className="mt-5 space-y-4">
            {project.tasks.length ? (
              project.tasks.map((task) => {
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
                          <h4 className="text-lg font-semibold text-slate-950">{task.title}</h4>
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
                          Assigned to {task.assignedTo.name} • Due {formatDate(task.dueDate)}
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
                        <TaskStatusForm taskId={task.id} status={task.status} disabled={!canEdit} />
                        {session.user.role === Role.ADMIN ? <DeleteTaskButton taskId={task.id} /> : null}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="No tasks in this project"
                description="Create the first task to start tracking assignments and progress."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
