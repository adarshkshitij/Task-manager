"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

export function CreateTaskForm({
  projectId,
  members,
}: {
  projectId: string;
  members: Array<{ id: string; name: string; email: string }>;
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
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="rounded-[24px] border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">Create and assign task</h3>
      <p className="mt-1 text-sm text-slate-600">
        Assign work to a project member and set status, priority, and due date.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="task-title" className="mb-2 block text-sm font-medium text-slate-700">
            Task title
          </label>
          <input
            id="task-title"
            name="title"
            placeholder="Prepare sprint summary"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="task-description" className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="task-description"
            name="description"
            rows={3}
            placeholder="Optional task description"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>
        <div>
          <label htmlFor="task-assigned-to" className="mb-2 block text-sm font-medium text-slate-700">
            Assign to
          </label>
          <select
            id="task-assigned-to"
            name="assignedToId"
            defaultValue={members[0]?.id}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} - {member.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="task-priority" className="mb-2 block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="task-priority"
            name="priority"
            defaultValue="MEDIUM"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
          >
            <option value="LOW">Low priority</option>
            <option value="MEDIUM">Medium priority</option>
            <option value="HIGH">High priority</option>
          </select>
        </div>
        <div>
          <label htmlFor="task-status" className="mb-2 block text-sm font-medium text-slate-700">
            Initial status
          </label>
          <select
            id="task-status"
            name="status"
            defaultValue="TODO"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
          >
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div>
          <label htmlFor="task-due-date" className="mb-2 block text-sm font-medium text-slate-700">
            Due date
          </label>
          <input
            id="task-due-date"
            type="date"
            name="dueDate"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-600">{message}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
      >
        {isPending ? "Creating..." : "Create task"}
      </button>
    </form>
  );
}
