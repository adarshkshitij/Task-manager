import { Users, Mail, Shield, Activity, Search, Filter } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function TeamPage() {
  const session = await getSession();
  
  if (!session) return null;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          assignedTasks: true,
          memberships: true,
        }
      }
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <Users className="h-10 w-10 text-indigo-600" />
            Human Capital
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Coordinate with your team and manage collective velocity.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search talent..." 
              className="pl-12 pr-6 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all w-64 shadow-sm"
            />
          </div>
          <button className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <div 
            key={u.id} 
            className="group relative overflow-hidden rounded-[40px] border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="h-32 w-32" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-16 w-16 rounded-[24px] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-lg border-2 border-white">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  u.role === "ADMIN" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-50 text-slate-500 border-slate-200"
                )}>
                  {u.role}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{u.name}</h3>
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
                  <Mail className="h-3 w-3 text-indigo-400" />
                  {u.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tasks</p>
                  <p className="text-lg font-black text-slate-900">{u._count.assignedTasks}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projects</p>
                  <p className="text-lg font-black text-slate-900">{u._count.memberships}</p>
                </div>
              </div>

              <Link 
                href={`/reports?userId=${u.id}`}
                className="block w-full text-center py-4 rounded-2xl bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
              >
                View Performance
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
