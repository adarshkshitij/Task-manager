"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Palette, 
  Globe,
  Smartphone,
  Mail,
  Moon,
  Sun,
  ShieldCheck,
  Activity,
  User,
  ChevronRight,
} from "lucide-react";
import { SettingsToggle } from "@/components/settings-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import { SecuritySettings } from "@/components/security-settings";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
    emailNotifications: boolean;
    desktopNotifications: boolean;
    systemActivityNotifications: boolean;
    theme: string;
    role: string;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user.name);
  const [displayName, setDisplayName] = useState(user.name);

  useEffect(() => {
    if (activeTab === "workspace" && user.role === "ADMIN") {
      setLoading(true);
      fetch("/api/admin/users")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setUsers(data.data);
        })
        .finally(() => setLoading(false));
    }

    if (activeTab === "logs") {
      setLoading(true);
      fetch("/api/logs")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setLogs(data.data);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab, user.role]);

  const handleProfileUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || name === displayName) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: user.email }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      
      const updatedUser = await res.json();
      setDisplayName(updatedUser.name);
      setName(updatedUser.name); // Sync name state to disable button
      toast.success("Identity profile updated successfully");
    } catch (error) {
      toast.error("Protocol failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const focusNameInput = () => {
    setActiveTab("profile");
    // Use a slightly longer delay to ensure the tab has rendered
    setTimeout(() => {
      const input = document.getElementById("profile-name-input");
      if (input) {
        input.focus();
        // Move cursor to end of text
        if (input instanceof HTMLInputElement) {
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
      }
    }, 150);
  };

  const themeOptions = [
    { 
      id: "light",
      title: "Core Light", 
      description: "Default clean SaaS experience optimized for clarity.",
      icon: Sun,
    },
    { 
      id: "dark",
      title: "Deep Space", 
      description: "High-contrast dark interface for low-light focus.",
      icon: Moon,
      badge: "PREMIUM",
    },
  ];

  const tabs = [
    { id: "profile", label: "Personal Info", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  if (user.role === "ADMIN") {
    tabs.push(
      { id: "workspace", label: "Workspace", icon: Globe },
      { id: "logs", label: "System Logs", icon: Activity }
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700 overflow-hidden">
      {/* Profile Banner */}
      <section className="relative overflow-hidden rounded-[40px] bg-slate-900 p-8 sm:p-10 text-white shadow-2xl border border-white/5 shrink-0">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
          <Activity className="h-72 w-72 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="h-24 w-24 rounded-[32px] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-4xl font-black shadow-2xl shadow-indigo-500/40 border-4 border-white/10">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-black tracking-tight">{displayName}</h1>
                <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                  {user.role}
                </span>
              </div>
              <p className="mt-3 text-slate-400 font-medium flex items-center gap-3 text-lg">
                <Mail className="h-5 w-5 text-indigo-400" />
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={focusNameInput}
               className="px-8 py-4 rounded-3xl bg-white text-slate-900 text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
             >
               Edit Profile
             </button>
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden">
        {/* Modern Navigation Rail */}
        <aside className="lg:col-span-3 space-y-2 overflow-y-auto custom-scrollbar pr-2">
          <p className="px-5 mb-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">System Control</p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300 group relative",
                activeTab === tab.id 
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <tab.icon className={cn("h-4 w-4 transition-transform duration-500", activeTab === tab.id ? "text-indigo-600 scale-110" : "text-slate-400 group-hover:text-slate-600 group-hover:rotate-12")} />
                <span className="tracking-tight">{tab.label}</span>
              </div>
              {activeTab === tab.id && (
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
              )}
            </button>
          ))}
        </aside>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-9 h-full overflow-y-auto custom-scrollbar pr-2">
          <div className="animate-in fade-in duration-500 pb-12">
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="px-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <User className="h-6 w-6 text-indigo-600" />
                    Personal Dimensions
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium">Manage your public identity and contact vectors.</p>
                </div>
                <div className="rounded-[48px] border border-slate-200/60 bg-white p-10 shadow-sm space-y-8">
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Display Name</label>
                      <input 
                        id="profile-name-input"
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email Protocol</label>
                      <input 
                        type="email" 
                        defaultValue={user.email}
                        disabled
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50/30 px-5 py-4 text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleProfileUpdate}
                    disabled={isSaving || name === displayName}
                    className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </button>
                </div>
              </div>
            )}


            {activeTab === "appearance" && (
              <div className="space-y-8">
                <div className="px-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <Palette className="h-6 w-6 text-fuchsia-600" />
                    Visual Interface
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium">Customize the aesthetic experience of your workspace.</p>
                </div>
                <div className="rounded-[48px] border border-slate-200/60 bg-white p-10 shadow-sm">
                  <ThemeSelector 
                    options={themeOptions}
                    initialTheme={user.theme}
                  />
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-8">
                <div className="px-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <Bell className="h-6 w-6 text-amber-600" />
                    Communication Sync
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium">Control the velocity and frequency of system alerts.</p>
                </div>
                <div className="rounded-[48px] border border-slate-200/60 bg-white p-2 shadow-sm overflow-hidden">
                  <SettingsToggle 
                    field="emailNotifications"
                    title="Email Briefings" 
                    description="Receive sophisticated summaries of your team's velocity and milestones."
                    icon={Mail}
                    initialValue={user.emailNotifications}
                  />
                  <div className="h-px bg-slate-50 mx-10" />
                  <SettingsToggle 
                    field="desktopNotifications"
                    title="Direct Pings" 
                    description="Instant browser alerts when tasks require your immediate attention."
                    icon={Smartphone}
                    initialValue={user.desktopNotifications}
                  />
                  <div className="h-px bg-slate-50 mx-10" />
                  <SettingsToggle 
                    field="systemActivityNotifications"
                    title="Operational Logs" 
                    description="Log every significant change to ensure full accountability across the workspace."
                    icon={Activity}
                    initialValue={user.systemActivityNotifications}
                  />
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-8">
                <div className="px-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                    Access Control
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium">Strengthen your vault with multi-layer security protocols.</p>
                </div>
                <SecuritySettings />
              </div>
            )}

            {activeTab === "workspace" && (
              <div className="space-y-8">
                <div className="px-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <Globe className="h-6 w-6 text-indigo-600" />
                    Workspace Orchestra
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium">Manage team composition and dimensional access roles.</p>
                </div>
                <div className="rounded-[48px] border border-slate-200/60 bg-white p-2 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-50">
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Collaborator</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Velocity</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-8 py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing user data...</td>
                          </tr>
                        ) : (
                          users.map((u: any) => (
                            <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs border border-indigo-100 group-hover:scale-110 transition-transform">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-slate-900">{u.name}</p>
                                    <p className="text-xs font-medium text-slate-500">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                  u.role === "ADMIN" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-50 text-slate-500 border-slate-200"
                                )}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-slate-900">{u._count.assignedTasks}</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Tasks</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <button className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all">
                                  <ChevronRight className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-8">
                <div className="px-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <Activity className="h-6 w-6 text-rose-600" />
                    Operational Pulse
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium">Real-time audit stream of all workspace modifications.</p>
                </div>
                <div className="rounded-[48px] border border-slate-200/60 bg-white p-8 shadow-sm">
                  <div className="space-y-6">
                    {logs.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Retrieving system logs...</div>
                    ) : (
                      logs.map((log: any, i: number) => (
                        <div key={log.id} className="relative flex gap-6 group">
                          {i !== logs.length - 1 && (
                            <div className="absolute left-[19px] top-10 bottom-[-24px] w-px bg-slate-100" />
                          )}
                          <div className="relative h-10 w-10 shrink-0 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div className="pt-1">
                            <p className="text-sm leading-relaxed text-slate-600">
                              <span className="font-black text-slate-900">{log.user.name}</span>
                              <span className="mx-2 text-slate-300 font-bold tracking-widest uppercase text-[10px]">{log.type}</span>
                              {log.details}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
