import { format } from "date-fns";
import { Activity, User, Clock, ChevronRight, Globe, Zap, History } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const session = await requireSession();

  const logs = await prisma.activityLog.findMany({
    where: session.user.role === "ADMIN" ? {} : {
      OR: [
        { userId: session.user.id },
        { projectId: { in: (await prisma.projectMember.findMany({ where: { userId: session.user.id }, select: { projectId: true } })).map(m => m.projectId) } }
      ]
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        }
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Fetch project names for logs that have a projectId
  const projectIds = [...new Set(logs.map(l => l.projectId).filter(Boolean))] as string[];
  const projects = projectIds.length > 0
    ? await prisma.project.findMany({ where: { id: { in: projectIds } }, select: { id: true, name: true } })
    : [];
  const projectMap = new Map(projects.map(p => [p.id, p.name]));

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700">
      {/* Header section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 text-slate-500 mb-1">
            <History className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Ledger</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            Workspace <span className="text-indigo-600">Pulse</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-2">Real-time audit stream of all workspace modifications and team interactions.</p>
        </div>
      </header>

      {/* Activity Timeline */}
      <div className="flex-1 min-h-0 bg-white/50 backdrop-blur-sm rounded-[48px] border border-slate-200/60 p-8 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
             <Activity className="h-4 w-4 text-rose-500" />
             Live Stream
           </h2>
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Syncing</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                <Clock className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">No events detected</p>
                <p className="text-xs font-bold text-slate-400 mt-1">The dimensional log is currently empty.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => {
                const projectName = log.projectId ? projectMap.get(log.projectId) : null;
                return (
                  <div 
                    key={log.id} 
                    className={cn(
                      "group relative flex gap-6 p-6 rounded-[32px] transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 border border-transparent hover:border-slate-100",
                      index !== logs.length - 1 && "before:absolute before:left-[43px] before:top-[88px] before:bottom-[-16px] before:w-px before:bg-slate-100"
                    )}
                  >
                    <div className="relative z-10 shrink-0">
                      <div className={cn(
                        "h-14 w-14 rounded-[22px] flex items-center justify-center shadow-sm border transition-transform duration-500 group-hover:rotate-6",
                        log.type.includes("CREATE") ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                        log.type.includes("UPDATE") ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
                        log.type.includes("DELETE") ? "bg-rose-50 border-rose-100 text-rose-600" :
                        "bg-slate-50 border-slate-100 text-slate-400"
                      )}>
                        {getActionIcon(log.type)}
                      </div>
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{format(log.createdAt, 'HH:mm:ss')}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                            log.user.role === "ADMIN" ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-slate-50 border-slate-200 text-slate-500"
                          )}>
                            {log.user.role}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(log.createdAt, 'MMM d, yyyy')}</span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-base font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                          {log.type.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-2xl">
                          {log.details}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                            {log.user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{log.user.name}</span>
                        </div>
                        {projectName && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{projectName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center self-center pr-4">
                      <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getActionIcon(action: string) {
  if (action.includes("CREATE")) return <Zap className="h-6 w-6" />;
  if (action.includes("UPDATE")) return <Activity className="h-6 w-6" />;
  if (action.includes("DELETE")) return <Clock className="h-6 w-6" />;
  return <History className="h-6 w-6" />;
}
