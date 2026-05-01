import { Role } from "@prisma/client";
import Link from "next/link";
import { CreateProjectForm } from "@/components/create-project-form";
import { EmptyState } from "@/components/empty-state";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

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
        take: 3,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className={`grid gap-6 ${session.user.role === Role.ADMIN ? "xl:grid-cols-[0.9fr_1.1fr]" : ""}`}>
      {session.user.role === Role.ADMIN ? <CreateProjectForm /> : null}

      <div className="space-y-4">
        <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]">
          <h2 className="text-xl font-semibold text-slate-950">Projects</h2>
          <p className="mt-1 text-sm text-slate-600">
            {session.user.role === Role.ADMIN
              ? "Manage teams, open task boards, and assign work."
              : "View the projects you belong to and follow current task progress."}
          </p>

          <div className="mt-6 space-y-4">
            {projects.length ? (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                      <p className="mt-2 max-w-xl text-sm text-slate-600">
                        {project.description || "No description provided for this project yet."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                        <span className="rounded-full bg-slate-200 px-3 py-1">
                          {project._count.members} members
                        </span>
                        <span className="rounded-full bg-slate-200 px-3 py-1">
                          {project._count.tasks} tasks
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      <p>Team preview</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {project.members.map((member) => member.user.name).join(", ") || "No members"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                title="No projects available"
                description="Create your first project to start assigning tasks and tracking progress."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
