"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  FolderKanban, 
  LayoutDashboard, 
  ListTodo, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  HelpCircle,
  Command,
  Bell,
  Users,
  BarChart3,
  Hash,
  UserCheck,
  Clock,
  Zap,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/team", label: "Team", icon: Users },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

const smartViews = [
  { href: "/tasks?filter=mine", label: "My Tasks", icon: UserCheck, color: "text-emerald-400" },
  { href: "/tasks?filter=overdue", label: "Overdue", icon: Clock, color: "text-rose-400" },
  { href: "/tasks?filter=high", label: "High Priority", icon: Zap, color: "text-amber-400" },
];

export function Sidebar({ 
  isCollapsed, 
  onToggle,
  onNewTask,
  onNewProject,
  onInvite
}: { 
  isCollapsed: boolean, 
  onToggle: () => void,
  onNewTask?: () => void,
  onNewProject?: () => void,
  onInvite?: () => void,
}) {
  const currentPath = usePathname();
  const [pinnedProjects, setPinnedProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPinnedProjects = async () => {
    try {
      const res = await fetch("/api/projects/pinned");
      if (res.ok) {
        const data = await res.json();
        setPinnedProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch pinned projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPinnedProjects();
  }, [currentPath]); // Re-fetch on navigation as it's a likely time for state changes

  return (
    <aside 
      className={cn(
        "relative z-50 flex h-full flex-col bg-[#0A0F1E] text-slate-400 transition-all duration-500 ease-in-out border-r border-white/5 shadow-2xl shrink-0",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Sidebar Header */}
      <div className={cn(
        "flex h-20 items-center px-6 border-b border-white/5",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-transform group-hover:scale-110">
            <Command className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span className="text-sm font-black tracking-widest text-white uppercase animate-in fade-in duration-500">TeamOps</span>
          )}
        </Link>
        
        {!isCollapsed && (
          <button 
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-white transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Sidebar Body */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scrollbar-hide">
        {/* Main Nav */}
        <nav className="space-y-1.5">
          {!isCollapsed && (
            <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-in fade-in duration-500">Navigation</p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 relative",
                  isActive
                    ? "bg-indigo-600/10 text-white"
                    : "hover:bg-white/5 hover:text-slate-200"
                )}
                title={isCollapsed ? item.label : ""}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                )}
                <Icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-300",
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                {!isCollapsed && (
                  <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>
                )}
                {!isCollapsed && isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="space-y-1.5">
          {!isCollapsed && (
            <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-in fade-in duration-500">Quick Links</p>
          )}
          <div className="px-2 space-y-1">
            <button
              onClick={onNewTask}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-indigo-600/10 hover:text-white transition-all group",
                isCollapsed ? "justify-center" : ""
              )}
              title={isCollapsed ? "New Task" : ""}
            >
              <PlusCircle className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-indigo-400" />
              {!isCollapsed && <span>New Task</span>}
            </button>
            {onNewProject && (
              <button
                onClick={onNewProject}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-indigo-600/10 hover:text-white transition-all group",
                  isCollapsed ? "justify-center" : ""
                )}
                title={isCollapsed ? "New Project" : ""}
              >
                <Plus className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-indigo-400" />
                {!isCollapsed && <span>New Project</span>}
              </button>
            )}
            <button
              onClick={onInvite}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-indigo-600/10 hover:text-white transition-all group",
                isCollapsed ? "justify-center" : ""
              )}
              title={isCollapsed ? "Invite Member" : ""}
            >
              <Users className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-indigo-400" />
              {!isCollapsed && <span>Invite Member</span>}
            </button>
            <Link
              href="/activity"
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-indigo-600/10 hover:text-white transition-all group",
                isCollapsed ? "justify-center" : ""
              )}
              title={isCollapsed ? "My Activity" : ""}
            >
              <Clock className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-indigo-400" />
              {!isCollapsed && <span>My Activity</span>}
            </Link>
            <Link
              href="/reports"
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-indigo-600/10 hover:text-white transition-all group",
                isCollapsed ? "justify-center" : ""
              )}
              title={isCollapsed ? "Workspace Stats" : ""}
            >
              <BarChart3 className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-indigo-400" />
              {!isCollapsed && <span>Workspace Stats</span>}
            </Link>
          </div>
        </div>

        {/* Smart Views */}
        <div className="space-y-1.5">
          {!isCollapsed && (
            <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-in fade-in duration-500">Smart Views</p>
          )}
          <div className="px-2 space-y-1">
            {smartViews.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300",
                    isActive
                      ? "bg-white/5 text-white"
                      : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
                  )}
                  title={isCollapsed ? item.label : ""}
                >
                  <Icon className={cn(
                    "h-5 w-5 shrink-0 transition-colors duration-300",
                    isActive ? item.color : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Workspace section */}
        <div className="space-y-1.5 pb-8">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-4 mb-4 animate-in fade-in duration-500">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pinned Projects</p>
              <Link href="/projects" className="text-slate-500 hover:text-white transition-colors">
                <Plus className="h-3 w-3" />
              </Link>
            </div>
          )}
          
          <div className="px-2 space-y-1">
             {isLoading ? (
               !isCollapsed && <div className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest animate-pulse">Scanning...</div>
             ) : pinnedProjects.length > 0 ? (
               pinnedProjects.map((project) => (
                <Link 
                  key={project.id} 
                  href={`/projects/${project.id}`}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all group",
                    currentPath === `/projects/${project.id}`
                      ? "bg-white/5 text-indigo-400"
                      : "text-slate-500 hover:bg-white/5 hover:text-slate-200",
                    isCollapsed ? "justify-center" : ""
                  )}
                  title={isCollapsed ? project.name : ""}
                >
                  <Hash className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-colors",
                    currentPath === `/projects/${project.id}` ? "text-indigo-400" : "text-slate-600 group-hover:text-indigo-400"
                  )} />
                  {!isCollapsed && <span className="truncate">{project.name}</span>}
                </Link>
              ))
             ) : (
               !isCollapsed && (
                 <div className="px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
                   <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic">No pinned projects.</p>
                 </div>
               )
             )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-auto border-t border-white/5 p-4 space-y-2">
        <Link 
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-white/5 hover:text-white transition-all",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? "Settings" : ""}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        <Link 
          href="/help"
          className={cn(
            "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-white/5 hover:text-white transition-all",
            isCollapsed ? "justify-center" : "",
            currentPath === "/help" ? "bg-white/5 text-white" : ""
          )}
          title={isCollapsed ? "Help" : ""}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Help Center</span>}
        </Link>
        
        {isCollapsed && (
          <button 
            onClick={onToggle}
            className="mt-4 flex w-full items-center justify-center py-2 text-slate-600 hover:text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
