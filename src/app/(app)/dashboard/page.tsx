import { addDays, format } from "date-fns";
import { Role, TaskStatus, TaskPriority } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getDueLabel, getStatusClasses, getPriorityClasses } from "@/lib/utils";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Activity, 
  Zap, 
  Target, 
  Layout, 
  Plus, 
  ChevronRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  const now = new Date();
  const dueSoonCutoff = addDays(now, 3);

  const taskWhere =
    session.user.role === Role.ADMIN
      ? {}
      : {
          assignedToId: session.user.id,
        };

  const [totalTasks, completedTasks, inProgressTasks, overdueTasks, dueSoonTasks, recentTasks] =
    await Promise.all([
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
          dueDate: { gte: now, lte: dueSoonCutoff },
          status: { not: TaskStatus.DONE },
        },
        include: { project: true, assignedTo: true },
        orderBy: { dueDate: "asc" },
        take: 3,
      }),
      prisma.task.findMany({
        where: taskWhere,
        include: { project: true, assignedTo: true },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
    ]);

  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeCount = totalTasks - completedTasks;

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-700">
      {/* Refined Status Bar (Compact Header) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 text-slate-500 mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{format(now, 'EEEE, MMMM do')}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            Welcome back, <span className="text-indigo-600">{session.user.name?.split(' ')[0] ?? 'User'}</span>.
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/tasks/new" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/20 transition-all active:scale-95">
             <Plus className="h-4 w-4" />
             Initiate Task
           </Link>
        </div>
      </header>

      {/* Metrics Rail - Minimalist & Data-Dense */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/reports" className="block"><MiniMetric label="Active Work" value={activeCount} icon={Activity} color="text-indigo-600" trend="+2% today" /></Link>
        <Link href="/reports" className="block"><MiniMetric label="Velocity" value={`${completionRate}%`} icon={Zap} color="text-amber-500" trend="Optimal" /></Link>
        <Link href="/reports" className="block"><MiniMetric label="Compliance" value={totalTasks - overdueTasks} icon={Target} color="text-emerald-500" trend="98% Score" /></Link>
        <Link href="/reports" className="block"><MiniMetric label="Risk Vectors" value={overdueTasks} icon={AlertCircle} color={overdueTasks > 0 ? "text-rose-500" : "text-slate-400"} trend={overdueTasks > 0 ? "Action Required" : "Zero Risks"} /></Link>
      </section>

      {/* Pulse Feed & Strategic Overview */}
      <div className="grid gap-6 lg:grid-cols-12 flex-1 min-h-0">
        {/* Main Pulse Feed */}
        <section className="lg:col-span-8 flex flex-col space-y-4 min-h-0">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Operational Pulse
            </h2>
            <Link href="/tasks" className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">
              Expand Feed
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto rounded-[40px] border border-slate-200/60 bg-white/50 backdrop-blur-sm p-2 space-y-1 shadow-sm custom-scrollbar">
            {recentTasks.map((task) => (
              <PulseItem key={task.id} task={task} />
            ))}
            {recentTasks.length === 0 && (
              <div className="h-full flex items-center justify-center py-20 text-slate-400">
                <p className="text-xs font-bold uppercase tracking-widest">No activity detected</p>
              </div>
            )}
          </div>
        </section>

        {/* Tactical Column */}
        <aside className="lg:col-span-4 flex flex-col space-y-6">
          {/* Due Soon Panel */}
          <div className="flex-1 rounded-[40px] border border-slate-200/60 bg-white p-8 shadow-sm flex flex-col min-h-0">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <Clock className="h-4 w-4 text-amber-500" />
              Next Milestones
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
              {dueSoonTasks.map((task) => (
                <Link href={`/tasks`} key={task.id} className="block group">
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-transparent transition-all duration-500 group">
                    <div className="flex justify-between items-start gap-4 mb-2">
                       <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{task.project.name}</p>
                       <span className="text-[10px] font-black text-rose-500">{getDueLabel(task.dueDate)}</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{task.title}</h4>
                  </div>
                </Link>
              ))}
              {dueSoonTasks.length === 0 && (
                <div className="h-full flex items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-[32px]">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clear Calendar</p>
                </div>
              )}
            </div>
          </div>
            
          {/* Quick Strategic Links */}
          <div className="rounded-[40px] border border-slate-200/60 bg-white p-8 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <Zap className="h-4 w-4 text-indigo-500" />
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/team?action=invite" className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-300 group">
                <Users className="h-5 w-5 mb-2 text-indigo-600 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Invite</span>
              </Link>
              <Link href="/activity" className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-300 group">
                <Activity className="h-5 w-5 mb-2 text-emerald-600 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Activity</span>
              </Link>
              <Link href="/reports" className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-300 group">
                <BarChart3 className="h-5 w-5 mb-2 text-amber-600 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Stats</span>
              </Link>
              <Link href="/settings" className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-300 group">
                <Layout className="h-5 w-5 mb-2 text-rose-600 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Settings</span>
              </Link>
            </div>
          </div>

          {/* Quick Analytics Mini-Widget */}
          <Link href="/reports" className="block rounded-[40px] border border-slate-200/60 bg-white p-8 shadow-sm group">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Overall Velocity</span>
                <BarChart3 className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
             </div>
             <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full group-hover:bg-indigo-500 transition-colors" style={{ width: `${completionRate}%` }} />
             </div>
          </Link>
        </aside>
      </div>
    </div>
  );
}

function MiniMetric({ label, value, icon: Icon, color, trend }: { label: string, value: string | number, icon: any, color: string, trend: string }) {
  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-150 transition-transform duration-700">
        <Icon className="h-16 w-16" />
      </div>
      <div className="flex flex-col gap-1 relative z-10">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-end gap-3 mt-1">
          <p className={cn("text-3xl font-black tracking-tighter", color)}>{value}</p>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-60">{trend}</span>
        </div>
      </div>
    </div>
  );
}

function PulseItem({ task }: { task: any }) {
  return (
    <Link href={`/tasks`} className="block group">
      <div className="flex items-center gap-5 p-5 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300 group">
        <div className={cn(
          "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-6 shadow-sm",
          task.status === TaskStatus.DONE ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
          task.status === TaskStatus.IN_PROGRESS ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
          "bg-slate-50 border-slate-100 text-slate-400"
        )}>
          {task.status === TaskStatus.DONE ? <CheckCircle2 className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{task.project.name}</span>
            <span className="h-1 w-1 rounded-full bg-slate-200" />
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border",
              getPriorityClasses(task.priority)
            )}>
              {task.priority}
            </span>
          </div>
          <h4 className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors tracking-tight">
            {task.title}
          </h4>
        </div>

        <div className="text-right shrink-0">
          <p className={cn(
            "text-[10px] font-black uppercase tracking-widest mb-1",
            task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE ? "text-rose-500" : "text-slate-400"
          )}>
            {getDueLabel(task.dueDate)}
          </p>
          <div className="flex justify-end">
             <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-600 shadow-sm">
                {task.assignedTo.name.charAt(0).toUpperCase()}
             </div>
          </div>
        </div>
        
        <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
