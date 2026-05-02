import { BarChart3, PieChart, TrendingUp, CheckCircle2, Clock, AlertCircle, Layout, Target } from "lucide-react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string, projectId?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const targetUserId = params.userId?.trim();
  const targetProjectId = params.projectId?.trim();
  const isAdmin = session.user.role === "ADMIN";

  // Security Scoping Logic
  if (targetUserId && !isAdmin && session.user.id !== targetUserId) {
    // Non-admins can only see their own analytics
    return redirect("/dashboard");
  }

  let targetUser = null;
  let targetProject = null;

  if (targetUserId) {
    targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { name: true }
    });
    if (!targetUser) return redirect("/reports");
  }

  if (targetProjectId) {
    // Check if user is member of the project or is admin
    if (!isAdmin) {
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: targetProjectId,
            userId: session.user.id
          }
        }
      });
      if (!membership) return redirect("/dashboard");
    }

    targetProject = await prisma.project.findUnique({
      where: { id: targetProjectId },
      select: { name: true }
    });
    if (!targetProject) return redirect("/reports");
  }

  // Aggregate stats based on scoping
  const taskWhereClause: any = {};
  const projectWhereClause: any = {};

  if (targetProjectId) {
    taskWhereClause.projectId = targetProjectId;
  } else if (targetUserId) {
    taskWhereClause.assignedToId = targetUserId;
  } else if (!isAdmin) {
    // Global view for non-admins: Only tasks in projects they belong to
    taskWhereClause.project = {
      members: { some: { userId: session.user.id } }
    };
    projectWhereClause.members = { some: { userId: session.user.id } };
  }

  const totalTasks = await prisma.task.count({ where: taskWhereClause });
  const todoTasks = await prisma.task.count({ where: { ...taskWhereClause, status: "TODO" } });
  const inProgressTasks = await prisma.task.count({ where: { ...taskWhereClause, status: "IN_PROGRESS" } });
  const doneTasks = await prisma.task.count({ where: { ...taskWhereClause, status: "DONE" } });
  
  const totalProjects = targetProjectId 
    ? 1 
    : (targetUserId 
        ? await prisma.project.count({ where: { members: { some: { userId: targetUserId } } } })
        : await prisma.project.count({ where: projectWhereClause }));

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  
  const activeUserCount = await prisma.user.count();

  const stats = [
    { label: "Completion Velocity", value: `${completionRate}%`, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: targetUserId ? "User Status" : "Active Nodes", value: targetUserId ? "Active" : activeUserCount, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Dimensional Projects", value: totalProjects, icon: Layout, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Operations", value: totalTasks, icon: BarChart3, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const pageTitle = targetUser 
    ? `${targetUser.name}'s Analytics` 
    : (targetProject ? `${targetProject.name} Analytics` : "Strategic Analytics");

  const pageDesc = targetUser 
    ? `Operational throughput and performance metrics for ${targetUser.name}.`
    : (targetProject ? `Detailed metrics and status overview for the ${targetProject.name} workspace.` : "Deep-dive into workspace metrics and operational throughput.");

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <PieChart className="h-10 w-10 text-indigo-600" />
            {pageTitle}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {pageDesc}
          </p>
        </div>
        {(targetUser || targetProject) && (
          <Link 
            href="/reports"
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
          >
            View Global Reports
          </Link>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[40px] border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-lg transition-all duration-500 group">
            <div className={cn("h-14 w-14 rounded-[24px] flex items-center justify-center mb-6 transition-transform group-hover:rotate-12", stat.bg, stat.color)}>
              <stat.icon className="h-7 w-7" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-[48px] border border-slate-200/60 bg-white p-10 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Operational Distribution</h3>
          <div className="space-y-8">
            {[
              { label: "Ready for Execution", count: todoTasks, total: totalTasks, color: "bg-slate-200", icon: Clock },
              { label: "In Active Orbit", count: inProgressTasks, total: totalTasks, color: "bg-indigo-500", icon: TrendingUp },
              { label: "Mission Accomplished", count: doneTasks, total: totalTasks, color: "bg-emerald-500", icon: CheckCircle2 },
            ].map((item) => {
              const percent = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
              return (
                <div key={item.label} className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-slate-400" />
                      <span className="font-bold text-slate-700">{item.label}</span>
                    </div>
                    <span className="font-black text-slate-900">{item.count} Tasks ({percent}%)</span>
                  </div>
                  <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={cn("h-full transition-all duration-1000", item.color)} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="rounded-[40px] bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <TrendingUp className="h-48 w-48" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-black tracking-tight mb-4">Workspace Velocity</h3>
              <p className="text-4xl font-black tracking-tighter">1.2x</p>
              <p className="text-slate-400 text-sm font-medium mt-2 leading-relaxed">System performance is exceeding historical benchmarks.</p>
              <button className="mt-8 w-full py-4 rounded-2xl bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                Export Data
              </button>
            </div>
          </div>

          <div className="rounded-[40px] border border-slate-200/60 bg-white p-10 shadow-sm flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-[24px] bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Critical Intercepts</h3>
            <p className="text-slate-500 text-sm font-medium mt-2">Zero task slippage detected in the current cycle.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
