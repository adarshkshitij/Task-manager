"use client";

import { useRouter } from "next/navigation";
import { UserMinus } from "lucide-react";
import { useState, useTransition } from "react";

export function RemoveMemberButton({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    const confirmed = window.confirm("Remove this member from the project?");

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to remove member.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-70"
      >
        <UserMinus className="h-3.5 w-3.5" />
        {isPending ? "Removing..." : "Remove"}
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
