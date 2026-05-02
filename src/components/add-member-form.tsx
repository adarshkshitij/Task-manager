"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { UserPlus, UserCheck, AlertCircle, Loader2 } from "lucide-react";

export function AddMemberForm({
  projectId,
  users,
}: {
  projectId: string;
  users: Array<{ id: string; name: string; email: string; role: string }>;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: String(formData.get("userId") ?? ""),
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to add member.");
        return;
      }

      setMessage(payload.message ?? "Member added.");
      formRef.current?.reset();
      router.refresh();
    });
  }

  if (!users.length) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-slate-50/50 p-6 text-center">
        <UserCheck className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-2 text-sm font-medium text-slate-600">Workspace at capacity</p>
        <p className="mt-1 text-xs text-slate-500">All available users are already part of this project.</p>
      </div>
    );
  }

  return (
    <form 
      ref={formRef} 
      action={handleSubmit} 
      className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 transition-all hover:shadow-xl hover:shadow-indigo-500/5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">Add Member</h3>
          <p className="text-xs font-medium text-slate-500">Expand your mission team</p>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="member-user" className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Select Operative
        </label>
        <div className="relative">
          <select
            id="member-user"
            name="userId"
            defaultValue={users[0]?.id}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
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
          <UserCheck className="h-4 w-4 shrink-0" />
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
            <span>Adding Operative...</span>
          </>
        ) : (
          "Add to Workspace"
        )}
      </button>
    </form>
  );
}
