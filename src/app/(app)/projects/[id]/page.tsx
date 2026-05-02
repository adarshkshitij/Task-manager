import { Role, TaskStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
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
import { 
  Users, 
  Layout as LayoutIcon, 
  Calendar, 
  Plus, 
  AlertCircle,
  Clock,
  Briefcase,
  BarChart3
} from "lucide-react";

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
  
  const isAdmin = session.user.role === Role.ADMIN;
  const activeTasks = project.tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completedTasks = project.tasks.filter(t => t.status === TaskStatus.DONE).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Project Header */}
      <header className="relative overflow-hidden rounded-[32px] bg-white border border-slate-200 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
              <Link href="/projects" className="hover:text-indigo-600 transition-colors">Projects</Link>
              <span className="text-slate-300">/</span>
              <span className="text-indigo-600">Project Intelligence</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[0_8px_20px_rgba(79,70,229,0.3)]">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {project.name}
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  Created by <span className="text-slate-900 font-bold">{project.createdBy.name}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  {formatDate(project.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-center px-4 border-r border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Active</p>
                <p className="text-lg font-bold text-slate-900 leading-none">{activeTasks}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Closed</p>
                <p className="text-lg font-bold text-emerald-600 leading-none">{completedTasks}</p>
              </div>
            </div>

            <Link 
              href={`/reports?projectId=${project.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group"
            >
              <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              View Analytics
            </Link>
          </div>
        </div>
        
        {project.description && (
          <div className="mt-8 pt-8 border-t border-slate-100 max-w-4xl">
            <p className="text-base text-slate-600 leading-relaxed font-medium">
              {project.description}
            </p>
          </div>
        )}
      </header>

      {/* Main Grid Layout */}
      <div className="grid gap-8 xl:grid-cols-[400px_1fr]">
        {/* Left Column: Sidebar Command */}
        <div className="space-y-6">
          {/* Team Members Section */}
          <section className="rounded-[32px] border border-slate-200/60 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Team Command</h3>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">{project.members.length} Total</span>
            </div>

            <div className="space-y-3">
              {project.members.map((member) => (
                <div key={member.id} className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-lg hover:border-transparent">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 shadow-sm">
                        {member.user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{member.user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{member.user.role}</p>
                      </div>
                    </div>
                    {isAdmin && project.createdById !== member.user.id ? (
                      <RemoveMemberButton projectId={project.id} userId={member.user.id} />
                    ) : project.createdById === member.user.id ? (
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Creator</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            
            {isAdmin && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <AddMemberForm projectId={project.id} users={availableUsers} />
              </div>
            )}
          </section>

          {/* Quick Actions / Create Task */}
          <section className="rounded-[32px] border border-slate-200/60 bg-slate-900 p-8 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.25)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">New Mission</h3>
                </div>
                <CreateTaskForm
                  projectId={project.id}
                  members={project.members.map((member) => ({
                    id: member.user.id,
                    name: member.user.name,
                    email: member.user.email,
                  }))}
                />
              </div>
          </section>
        </div>

        {/* Right Column: Task Registry */}
        <div className="space-y-6">
          <section className="rounded-[32px] border border-slate-200/60 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <LayoutIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project Registry</h2>
                  <p className="text-sm font-semibold text-slate-500">Operational tasks and delivery status</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {project.tasks.length ? (
                project.tasks.map((task) => {
                  const canEdit = 
                    session.user.role === Role.ADMIN || 
                    task.assignedTo.id === session.user.id ||
                    task.createdById === session.user.id;
                  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.DONE;

                  return (
                    <div
                      key={task.id}
                      className={`group rounded-3xl border transition-all duration-300 p-6 ${
                        isOverdue 
                          ? "border-rose-100 bg-rose-50/30 hover:bg-white hover:border-rose-200" 
                          : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xl"
                      }`}
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusClasses(task.status)}`}>
                              {task.status.replaceAll("_", " ")}
                            </span>
                            <span className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2 font-medium">
                            {task.description || "No supplemental details provided for this assignment."}
                          </p>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 uppercase">
                                {task.assignedTo.name.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-slate-700">{task.assignedTo.name}</span>
                            </div>
                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                            <div className={`flex items-center gap-2 text-xs font-bold ${isOverdue ? "text-rose-600" : "text-slate-500"}`}>
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Due {formatDate(task.dueDate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[180px]">
                          <div className={`rounded-2xl px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 ${
                            isOverdue ? "bg-rose-100 text-rose-700" : "bg-white border border-slate-200 text-slate-700 shadow-sm"
                          }`}>
                            {isOverdue ? <AlertCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                            {getDueLabel(task.dueDate)}
                          </div>
                          <TaskStatusForm taskId={task.id} status={task.status} disabled={!canEdit} />
                          {(isAdmin || task.createdById === session.user.id) && (
                            <div className="pt-2 border-t border-slate-100 lg:border-none lg:pt-0">
                              <DeleteTaskButton taskId={task.id} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  title="No records found"
                  description="This project doesn't have any active tasks yet. Start building by adding your first mission item."
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

