"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Briefcase, X, Loader2, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    startTransition(async () => {
      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to create project");
          return;
        }

        setSuccess(true);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1500);
      } catch (err) {
        setError("An unexpected error occurred");
      }
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-[40px] bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-300 ring-1 ring-slate-200">
        <div className="absolute top-0 right-0 p-6">
          <button 
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          <div className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[24px] bg-indigo-600 text-white shadow-xl shadow-indigo-200">
              <Briefcase className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">New Workspace</h2>
            <p className="mt-2 text-sm font-medium text-slate-500 italic">Provision a new tactical environment</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Project Identity
              </label>
              <div className="relative group">
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="E.g., Project Antigravity"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 group-hover:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Strategic Brief
              </label>
              <div className="relative group">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Define the scope and objectives..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 group-hover:border-slate-300"
                />
                <FileText className="pointer-events-none absolute right-5 bottom-5 h-4 w-4 text-slate-300" />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-600 border border-rose-100 animate-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-600 border border-emerald-100 animate-in slide-in-from-top-2">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-xs font-bold">Workspace provisioned successfully!</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || success}
            className={cn(
              "mt-10 flex w-full items-center justify-center gap-3 rounded-3xl py-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl",
              success ? "bg-emerald-600 text-white shadow-emerald-200" : "bg-slate-900 text-white shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Syncing Data...</span>
              </>
            ) : success ? (
              "Deploying..."
            ) : (
              "Create Workspace"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
