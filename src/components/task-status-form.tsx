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
    <div>
      <select
        value={status}
        disabled={disabled || isPending}
        onChange={(event) => {
          void updateStatus(event.target.value);
        }}
        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 disabled:opacity-70"
      >
        <option value="TODO">To do</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="DONE">Done</option>
      </select>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
