"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (mode === "login") {
      startTransition(async () => {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/dashboard",
        });

        if (result?.error) {
          setError("Invalid email or password.");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      });

      return;
    }

    const name = String(formData.get("name") ?? "");
    const role = String(formData.get("role") ?? "MEMBER");

    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to create account.");
        return;
      }

      setSuccess("Account created. Signing you in...");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="w-full rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-amber-600">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          {mode === "login" ? "Sign in to manage work" : "Start organizing your team"}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {mode === "login"
            ? "Use your email and password to access your dashboard."
            : "Create an admin or member account to begin tracking projects and tasks."}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {mode === "signup" ? (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Adarsh Kumar"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
              required
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Minimum 6 characters"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
            required
          />
        </div>

        {mode === "signup" ? (
          <div>
            <label htmlFor="role" className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              defaultValue="MEMBER"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        ) : null}

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {success ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
        >
          {isPending
            ? mode === "login"
              ? "Signing in..."
              : "Creating account..."
            : mode === "login"
              ? "Login"
              : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
        <Link
          href={mode === "login" ? "/signup" : "/login"}
          className="font-semibold text-slate-950 underline decoration-amber-400 decoration-2 underline-offset-4"
        >
          {mode === "login" ? "Sign up" : "Login"}
        </Link>
      </p>

      {mode === "login" ? (
        <div className="mt-6 rounded-[24px] bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Demo accounts</p>
          <p className="mt-2 text-sm text-slate-600">Admin: `admin@example.com` / `Admin@123`</p>
          <p className="mt-1 text-sm text-slate-600">Member: `member@example.com` / `Member@123`</p>
        </div>
      ) : null}
    </div>
  );
}
