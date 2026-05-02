import { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreateTaskForm } from "@/components/create-task-form";
import { Target, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Role } from "@prisma/client";

export const metadata: Metadata = {
  title: "Initialize New Mission | Team Task Manager",
  description: "Deploy a new mission objective to your team.",
};

export default async function NewTaskPage() {
  const session = await requireSession();

  // Fetch projects user is part of
  const projects = await prisma.project.findMany({
    where: session.user.role === Role.ADMIN ? {} : {
      members: {
        some: {
          userId: session.user.id
        }
      }
    },
    select: {
      id: true,
      name: true
    }
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard"
          className="flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Task Intelligence</h1>
              <p className="text-sm font-medium text-slate-500 italic">Deploying new tactical objectives</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <CreateTaskForm projects={projects} />
      </div>
    </div>
  );
}
