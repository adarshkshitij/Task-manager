"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

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
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm text-slate-600">All available users are already part of this project.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="rounded-[24px] border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">Add project member</h3>
      <p className="mt-1 text-sm text-slate-600">Invite an existing account into this project workspace.</p>
      <div className="mt-4">
        <label htmlFor="member-user" className="mb-2 block text-sm font-medium text-slate-700">
          Select user
        </label>
        <select
          id="member-user"
          name="userId"
          defaultValue={users[0]?.id}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role}) - {user.email}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-600">{message}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
      >
        {isPending ? "Adding..." : "Add member"}
      </button>
    </form>
  );
}
