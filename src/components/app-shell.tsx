"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  Bell, 
  Search, 
  CheckCircle2, 
  Command,
  User,
  Settings,
  Globe
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

import { Sidebar } from "@/components/sidebar";
import { CreateProjectModal } from "@/components/create-project-modal";
import { CreateTaskModal } from "@/components/create-task-modal";
import { InviteMemberModal } from "@/components/invite-member-modal";

export function AppShell({
  children,
  userName,
  role,
}: {
  children: React.ReactNode;
  userName: string;
  role: "ADMIN" | "MEMBER";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeDropdown, setActiveDropdown] = useState<"search" | "notifications" | "profile" | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ projects: any[], tasks: any[] }>({ projects: [], tasks: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Handle action triggers from query params
    const action = searchParams.get("action");
    if (action === "invite" && role === "ADMIN") {
      setIsInviteModalOpen(true);
      // Clean up URL without reload
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("action");
      router.replace(`${pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`);
    } else if (action === "new-project" && role === "ADMIN") {
      setIsNewProjectModalOpen(true);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("action");
      router.replace(`${pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`);
    } else if (action === "new-task") {
      setIsNewTaskModalOpen(true);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("action");
      router.replace(`${pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveDropdown(null);
    };
    window.addEventListener("keydown", handleKeyDown);

    fetchNotifications();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchParams, role, pathname, router]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults({ projects: [], tasks: [] });
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#F8FAFC]" />;

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative flex overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="fixed -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px] z-0 pointer-events-none" />
      <div className="fixed -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px] z-0 pointer-events-none" />
      {/* Invisible click-away overlay */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setActiveDropdown(null)} 
        />
      )}

      {/* Premium Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onNewProject={role === "ADMIN" ? () => setIsNewProjectModalOpen(true) : undefined}
        onNewTask={() => setIsNewTaskModalOpen(true)}
        onInvite={role === "ADMIN" ? () => setIsInviteModalOpen(true) : undefined}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto px-4 py-6 sm:px-6 lg:px-8 overflow-hidden">
          {/* Refined Top Bar */}
          <header className="mb-6 flex items-center justify-between rounded-[32px] border border-slate-200 bg-white/80 p-2 pr-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-xl relative z-50 shrink-0">
            <div className="flex items-center gap-4 pl-4">
               {/* Mobile Nav Toggle / Breadcrumb-like feel */}
               <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <span className="text-slate-300">Workspace</span>
                  <ChevronDown className="h-3 w-3 text-slate-300 rotate-[-90deg]" />
                  <span className="text-indigo-600">Operations</span>
               </div>
               
               {/* Mobile Branding (only visible on small screens) */}
               <div className="flex lg:hidden items-center gap-2">
                 <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                   <Command className="h-4 w-4" />
                 </div>
                 <span className="text-xs font-black tracking-widest uppercase">TeamOps</span>
               </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Interactive Popover */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === "search" ? null : "search")}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-all border",
                    activeDropdown === "search" 
                      ? "bg-slate-50 text-slate-900 border-slate-200" 
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-900 border-transparent hover:border-slate-100"
                  )}
                >
                  <Search className="h-5 w-5" />
                </button>
                
                {activeDropdown === "search" && (
                  <div className="absolute right-0 top-full mt-3 w-[400px] rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative mb-4">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Quick search projects, tasks..." 
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                        autoFocus
                      />
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-4">
                      {isSearching ? (
                        <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Searching Dimensions...</div>
                      ) : searchQuery && searchResults.projects.length === 0 && searchResults.tasks.length === 0 ? (
                        <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No results found</div>
                      ) : (
                        <>
                          {searchResults.projects.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Projects</p>
                              {searchResults.projects.map((p: any) => (
                                <Link key={p.id} href={`/projects/${p.id}`} onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                  <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Globe className="h-4 w-4" />
                                  </div>
                                  <span className="text-sm font-bold text-slate-700">{p.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                          {searchResults.tasks.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Tasks</p>
                              {searchResults.tasks.map((t: any) => (
                                <Link key={t.id} href={`/tasks`} onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                  <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    <CheckCircle2 className="h-4 w-4" />
                                  </div>
                                  <span className="text-sm font-bold text-slate-700">{t.title}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications Interactive Popover */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === "notifications" ? null : "notifications")}
                  className={cn(
                    "relative h-10 w-10 flex items-center justify-center rounded-full transition-all border",
                    activeDropdown === "notifications" 
                      ? "bg-slate-50 text-slate-900 border-slate-200" 
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-900 border-transparent hover:border-slate-100"
                  )}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>
                
                {activeDropdown === "notifications" && (
                  <div className="absolute right-0 top-full mt-3 w-80 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Activity Feed</h3>
                      {notifications.some(n => !n.read) && (
                        <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No recent pulses</div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => !n.read && markAsRead(n.id)}
                            className={cn(
                              "flex gap-4 group cursor-pointer p-2 rounded-2xl transition-all",
                              !n.read ? "bg-slate-50/50" : "opacity-60"
                            )}
                          >
                            <div className={cn(
                              "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                              !n.read ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                            )}>
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs leading-snug text-slate-600">
                                <span className="font-black text-slate-900">{n.title}</span><br />
                                {n.message}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="h-8 w-px bg-slate-100 mx-2" />

              {/* User Profile Dropdown */}
              <div className="relative">
                <div 
                  onClick={() => setActiveDropdown(activeDropdown === "profile" ? null : "profile")}
                  className={cn(
                    "flex items-center gap-3 group cursor-pointer p-1 pr-3 rounded-full transition-all border",
                    activeDropdown === "profile" 
                      ? "bg-slate-50 border-slate-200" 
                      : "hover:bg-slate-50 border-transparent hover:border-slate-100 shadow-sm"
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-600 border border-indigo-500 flex items-center justify-center text-white font-black text-[10px] shadow-inner overflow-hidden">
                     {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[10px] font-black text-slate-900 leading-none">{userName}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role}</p>
                  </div>
                  <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", activeDropdown === "profile" ? "rotate-180 text-slate-900" : "text-slate-300")} />
                </div>

                {activeDropdown === "profile" && (
                  <div className="absolute right-0 top-full mt-3 w-60 rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-4 mb-2 border-b border-slate-50">
                      <p className="text-sm font-black text-slate-900 truncate">{userName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role === "ADMIN" ? "Administrator" : "Team Member"}</p>
                    </div>
                    <div className="space-y-1">
                      <Link href="/profile" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      <Link href="/settings" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                        <Settings className="h-4 w-4" />
                        Account Settings
                      </Link>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-50">
                       <SignOutButton />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto custom-scrollbar pb-12 pr-2">
            {children}
          </main>
        </div>
      </div>
      {/* Global Modals */}
      <CreateProjectModal 
        isOpen={isNewProjectModalOpen} 
        onClose={() => setIsNewProjectModalOpen(false)} 
      />
      <CreateTaskModal 
        isOpen={isNewTaskModalOpen} 
        onClose={() => setIsNewTaskModalOpen(false)} 
      />
      <InviteMemberModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
    </div>
  );
}
