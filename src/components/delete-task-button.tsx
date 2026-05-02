"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm("Delete this task? This action cannot be undone.");

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to delete task.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        title="Delete task"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete task</span>
      </button>
      {error ? <span className="absolute -bottom-6 right-0 w-max rounded bg-rose-100 px-2 py-1 text-[10px] font-medium text-rose-600">{error}</span> : null}
    </div>
  );
}
