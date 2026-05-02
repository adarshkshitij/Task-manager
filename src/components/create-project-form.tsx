"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Plus, LayoutGrid, Type, AlignLeft } from "lucide-react";

export function CreateProjectForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          description: String(formData.get("description") ?? ""),
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to create project.");
        return;
      }

      setMessage(payload.message ?? "Project created.");
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <div className="sticky top-6">
      <form
        ref={formRef}
        action={handleSubmit}
        className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="border-b border-slate-100 bg-slate-50/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">New Project</h3>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Workspace Creation</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="project-name" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Type className="h-4 w-4 text-slate-400" />
                Project Name
              </label>
              <input
                id="project-name"
                name="name"
                placeholder="e.g. Q4 Growth Initiative"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="project-description" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <AlignLeft className="h-4 w-4 text-slate-400" />
                Description
              </label>
              <textarea
                id="project-description"
                name="description"
                placeholder="Briefly describe the project goals..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 border border-rose-100">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600 border border-emerald-100">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="group relative w-full overflow-hidden rounded-2xl bg-slate-900 px-4 py-4 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-70"
          >
            <div className="flex items-center justify-center gap-2">
              {isPending ? (
                "Creating Workspace..."
              ) : (
                <>
                  <span>Create Project</span>
                  <LayoutGrid className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </div>
          </button>
          
          <p className="text-center text-[11px] font-medium text-slate-400">
            Members and tasks can be managed from the project dashboard after creation.
          </p>
        </div>
      </form>
    </div>
  );
}
