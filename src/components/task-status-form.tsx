"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function TaskStatusForm({
  taskId,
  status,
  disabled,
}: {
  taskId: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  disabled?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function updateStatus(nextStatus: string) {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to update task.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="relative flex items-center">
      <select
        value={status}
        disabled={disabled || isPending}
        onChange={(event) => {
          void updateStatus(event.target.value);
        }}
        className="h-8 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-slate-50/50 pl-3 pr-8 text-xs font-medium text-slate-700 outline-none transition hover:bg-slate-100 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="TODO">To do</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="DONE">Done</option>
      </select>
      {/* Custom Chevron for select */}
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      {error ? <span className="absolute -bottom-6 right-0 w-max rounded bg-rose-100 px-2 py-1 text-[10px] font-medium text-rose-600">{error}</span> : null}
    </div>
  );
}
