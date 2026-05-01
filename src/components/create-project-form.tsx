"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

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
    <form ref={formRef} action={handleSubmit} className="rounded-[24px] bg-slate-950 p-5 text-white">
      <h3 className="text-lg font-semibold">Create a new project</h3>
      <p className="mt-1 text-sm text-slate-300">
        Start with the project basics, then add members and tasks from the detail page.
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="project-name" className="mb-2 block text-sm font-medium text-slate-200">
            Project name
          </label>
          <input
            id="project-name"
            name="name"
            placeholder="Website redesign"
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-amber-300"
            required
          />
        </div>
        <div>
          <label htmlFor="project-description" className="mb-2 block text-sm font-medium text-slate-200">
            Description
          </label>
          <textarea
            id="project-description"
            name="description"
            placeholder="Short project description"
            rows={3}
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-slate-300 focus:border-amber-300"
          />
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:opacity-70"
      >
        {isPending ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}
