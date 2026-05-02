import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Role, TaskStatus } from "@prisma/client";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  CheckCircle2, 
  Layout, 
  Clock,
  Camera
} from "lucide-react";
import { format } from "date-fns";
import { ProfileEditTrigger } from "@/components/profile-edit-trigger";
import { ProfileAvatar } from "@/components/profile-avatar";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          assignedTasks: true,
          memberships: true,
        }
      }
    }
  });

  if (!user) return null;

  const completedTasksCount = await prisma.task.count({
    where: {
      assignedToId: user.id,
      status: TaskStatus.DONE
    }
  });

  const stats = [
    { label: "Assigned Tasks", value: user._count.assignedTasks, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Tasks Completed", value: completedTasksCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Projects", value: user._count.memberships, icon: Layout, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header / Hero */}
      <section className="relative overflow-hidden rounded-[40px] bg-slate-950 p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/5">
        <div className="absolute -right-24 -top-24 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <ProfileAvatar initials={user.name.charAt(0).toUpperCase()} />

          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 backdrop-blur-md mb-6">
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              <span>{user.role === Role.ADMIN ? "System Administrator" : "Team Specialist"}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-none mb-4">
              {user.name}
            </h1>
            <p className="text-lg text-slate-400 font-medium max-w-xl">
              Professional {user.role === Role.ADMIN ? "Admin" : "Member"} account managed within the TeamOps ecosystem.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Account Details */}
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-[40px] border border-slate-200/60 bg-white p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-10 flex items-center gap-3">
              <UserIcon className="h-6 w-6 text-indigo-600" />
              Account Registry
            </h2>

            <div className="grid gap-8 sm:grid-cols-2">
              <DetailField 
                label="Full Name" 
                value={user.name} 
                icon={UserIcon} 
              />
              <DetailField 
                label="Primary Email" 
                value={user.email} 
                icon={Mail} 
              />
              <DetailField 
                label="Assigned Role" 
                value={user.role === Role.ADMIN ? "Administrator" : "Team Member"} 
                icon={Shield} 
              />
              <DetailField 
                label="Deployment Date" 
                value={format(user.createdAt, "MMMM d, yyyy")} 
                icon={Calendar} 
              />
            </div>

            <ProfileEditTrigger user={{ name: user.name, email: user.email }} />
          </section>
        </div>

        {/* Right Column: Key Stats */}
        <div className="space-y-8">
          <section className="rounded-[40px] border border-slate-200/60 bg-white p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">Performance Pulse</h2>
            <div className="space-y-4">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-3xl border border-slate-50 bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100/50">
              <p className="text-[11px] font-bold text-indigo-700/80 leading-relaxed italic text-center">
                &quot;Operational excellence is not an act, but a habit.&quot;
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value, icon: Icon }: { label: string, value: string, icon: React.ElementType }) {
  return (
    <div className="group space-y-2">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 transition-all group-hover:border-indigo-200 group-hover:bg-indigo-50/10">
        <Icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        <span className="text-sm font-bold text-slate-700">{value}</span>
      </div>
    </div>
  );
}
