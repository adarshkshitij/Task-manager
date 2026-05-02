import { Role } from "@prisma/client";
import Link from "next/link";
import { CreateProjectForm } from "@/components/create-project-form";
import { EmptyState } from "@/components/empty-state";
import { PinButton } from "@/components/pin-button";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { 
  Users, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await requireSession();

  const projects = await prisma.project.findMany({
    where:
      session.user.role === Role.ADMIN
        ? {}
        : {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
    include: {
      _count: {
        select: {
          members: true,
          tasks: true,
        },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const isAdmin = session.user.role === Role.ADMIN;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Premium Page Header */}
      <header className="relative overflow-hidden rounded-[32px] bg-white border border-slate-200 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
              <span>Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="text-indigo-600">Project Directory</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Project Workspace
            </h1>
            <p className="mt-3 text-lg text-slate-500 max-w-2xl font-medium">
              Organize initiatives, assign owners, and track team execution with real-time performance insights.
            </p>
          </div>

          {isAdmin && (
            <div className="hidden lg:block">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                <Layers className="h-3.5 w-3.5" />
                <span>Admin Control Active</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className={`grid gap-10 ${isAdmin ? "lg:grid-cols-[400px_1fr]" : "grid-cols-1"}`}>
        {/* Left Column: Admin Control Panel */}
        {isAdmin && (
          <aside className="space-y-6">
            <CreateProjectForm />
          </aside>
        )}

        {/* Right Column: Project Directory */}
        <main className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Project Directory</h2>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {projects.length} Total
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <span className="hidden sm:inline">Sort:</span>
              <select className="bg-transparent border-none focus:ring-0 cursor-pointer text-slate-900 font-bold pr-8">
                <option>Recently Updated</option>
                <option>Name A-Z</option>
                <option>Team Size</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {projects.length ? (
              projects.map((project) => {
                const myMembership = project.members.find(m => m.userId === session.user.id);
                const isPinned = myMembership?.pinned || false;
                const displayMembers = project.members.slice(0, 3);

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group relative block overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.08)]"
                  >
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {project.name}
                          </h3>
                          <div className="ml-2">
                            <PinButton 
                              projectId={project.id} 
                              initialPinned={isPinned} 
                            />
                          </div>
                        </div>

                        <p className="max-w-xl text-sm font-medium leading-relaxed text-slate-500 line-clamp-2">
                          {project.description || "No description provided for this project. Use the project dashboard to set goals and guidelines."}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">{project._count.members} Members</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100">
                            <Layers className="h-4 w-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">{project._count.tasks} Tasks</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 sm:items-end">
                        <div className="flex -space-x-3 overflow-hidden">
                          {displayMembers.length > 0 ? (
                            displayMembers.map((member) => (
                              <div
                                key={member.user.id}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600 shadow-sm transition hover:scale-110 hover:z-10"
                                title={member.user.name ?? "User"}
                              >
                                {(member.user.name ?? "U").substring(0, 2).toUpperCase()}
                              </div>
                            ))
                          ) : (
                            <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                              -
                            </div>
                          )}
                          {project._count.members > 3 && (
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-50 text-[10px] font-bold text-indigo-600 shadow-sm">
                              +{project._count.members - 3}
                            </div>
                          )}
                        </div>
                        
                        <div className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition group-hover:bg-indigo-600">
                          View Workspace
                          <ArrowUpRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <EmptyState
                title="Workspace is Empty"
                description="Start by creating your first project. You'll be able to invite team members and define core objectives instantly."
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
