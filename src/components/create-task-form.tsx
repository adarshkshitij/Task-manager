"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Target, Calendar, User, Flag, CheckCircle2, Loader2, AlertCircle, Briefcase } from "lucide-react";
import { useEffect } from "react";

export function CreateTaskForm({
  projectId: initialProjectId,
  members: initialMembers,
  projects,
  onSuccess,
}: {
  projectId?: string;
  members?: Array<{ id: string; name: string; email: string }>;
  projects?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [projectId, setProjectId] = useState(initialProjectId || "");
  const [members, setMembers] = useState(initialMembers || []);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Fetch members when projectId changes in global mode
  useEffect(() => {
    if (!initialProjectId && projectId) {
      const fetchMembers = async () => {
        setIsLoadingMembers(true);
        try {
          const res = await fetch(`/api/projects/${projectId}/members`);
          if (res.ok) {
            const data = await res.json();
            setMembers(data);
          }
        } catch (err) {
          console.error("Failed to fetch members:", err);
        } finally {
          setIsLoadingMembers(false);
        }
      };
      fetchMembers();
    }
  }, [projectId, initialProjectId]);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: String(formData.get("title") ?? ""),
          description: String(formData.get("description") ?? ""),
          status: String(formData.get("status") ?? "TODO"),
          priority: String(formData.get("priority") ?? "MEDIUM"),
          dueDate: String(formData.get("dueDate") ?? ""),
          assignedToId: String(formData.get("assignedToId") ?? ""),
          projectId,
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to create task.");
        return;
      }

      setMessage(payload.message ?? "Task created.");
      formRef.current?.reset();
      router.refresh();
      if (onSuccess) onSuccess();
    });
  }

  return (
    <form 
      ref={formRef} 
      action={handleSubmit} 
      className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 transition-all hover:shadow-xl hover:shadow-indigo-500/5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">New Mission</h3>
          <p className="text-xs font-medium text-slate-500">Deploy a new objective</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {!initialProjectId && projects && (
          <div>
            <label htmlFor="task-project" className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Project Workspace
            </label>
            <div className="relative">
              <select
                id="task-project"
                name="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white"
                required
              >
                <option value="" disabled>Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <Briefcase className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="task-title" className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Mission Title
          </label>
          <input
            id="task-title"
            name="title"
            placeholder="E.g., Q3 Security Audit"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            required
          />
        </div>

        <div>
          <label htmlFor="task-description" className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Intelligence Briefing
          </label>
          <textarea
            id="task-description"
            name="description"
            rows={2}
            placeholder="Detailed task requirements..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-assigned-to" className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Assignee
            </label>
            <div className="relative">
              <select
                id="task-assigned-to"
                name="assignedToId"
                disabled={isLoadingMembers || members.length === 0}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white disabled:opacity-50"
                required
              >
                {isLoadingMembers ? (
                  <option>Loading members...</option>
                ) : members.length > 0 ? (
                  members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))
                ) : (
                  <option value="">No members found</option>
                )}
              </select>
              <User className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label htmlFor="task-due-date" className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Deadline
            </label>
            <div className="relative">
              <input
                id="task-due-date"
                type="date"
                name="dueDate"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white"
              />
              <Calendar className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label htmlFor="task-priority" className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Priority
            </label>
            <div className="relative">
              <select
                id="task-priority"
                name="priority"
                defaultValue="MEDIUM"
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <Flag className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label htmlFor="task-status" className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Status
            </label>
            <div className="relative">
              <select
                id="task-status"
                name="status"
                defaultValue="TODO"
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">Active</option>
                <option value="DONE">Done</option>
              </select>
              <CheckCircle2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-emerald-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p className="text-xs font-semibold">{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-all hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Deploying Mission...</span>
          </>
        ) : (
          "Initialize Task"
        )}
      </button>
    </form>
  );
}
