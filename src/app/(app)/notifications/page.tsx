import { Bell, Check, Clock, Trash2, ShieldCheck, Mail, Info, Activity } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default async function NotificationsPage() {
  const session = await getSession();
  
  if (!session?.user) return null;

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "SYSTEM": return <ShieldCheck className="h-4 w-4" />;
      case "TASK": return <Activity className="h-4 w-4" />;
      case "PROJECT": return <Mail className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "SYSTEM": return "bg-rose-50 text-rose-600 border-rose-100";
      case "TASK": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "PROJECT": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <Bell className="h-10 w-10 text-indigo-600" />
            Communication Hub
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Stay updated with real-time operational broadcasts.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            Mark all read
          </button>
        </div>
      </div>

      <div className="rounded-[48px] border border-slate-200/60 bg-white p-8 shadow-sm">
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="h-16 w-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-300 mx-auto border border-slate-100">
                <Bell className="h-8 w-8" />
              </div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Silence is golden. No alerts found.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "relative group flex gap-6 p-6 rounded-[32px] transition-all border border-transparent",
                  n.read ? "bg-white opacity-60 hover:bg-slate-50/50" : "bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] border-slate-100 hover:border-indigo-100"
                )}
              >
                <div className={cn(
                  "h-12 w-12 shrink-0 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110",
                  getColor(n.type)
                )}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        n.read ? "text-slate-500 font-medium" : "text-slate-900 font-bold"
                      )}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                        <Check className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
