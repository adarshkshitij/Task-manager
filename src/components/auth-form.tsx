"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Lock, Eye, EyeOff, User, ShieldCheck, Mail, ArrowRight } from "lucide-react";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleDemoFill = (email: string, pass: string) => {
    if (emailRef.current && passwordRef.current) {
      emailRef.current.value = email;
      passwordRef.current.value = pass;
    }
  };

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


  // Handle keyboard shortcut for focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        emailRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden relative group/card transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)]">
      {/* Premium Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-500" />
      
      <div className="p-8 lg:p-10">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/60 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5">
             <ShieldCheck className="h-3 w-3 text-indigo-500" />
             Authorized Session
          </div>
          <h2 className="text-[32px] font-[1000] tracking-tighter text-slate-900 leading-none">
            {mode === "login" ? "Welcome back." : "Get started."}
          </h2>
          <p className="mt-3 text-[13px] text-slate-400 font-bold tracking-tight">
            {mode === "login" ? "Sign in to manage your high-velocity team." : "Create your workspace to begin shipping faster."}
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Display Name
              </label>
              <div className="relative group/field">
                <input
                  id="name"
                  name="name"
                  placeholder="e.g. Jane Foster"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-bold outline-none transition-all duration-300 placeholder:text-slate-300 placeholder:font-medium focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/5 hover:border-slate-300"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Email
            </label>
            <div className="relative group/field">
              <input
                ref={emailRef}
                id="email"
                type="email"
                name="email"
                placeholder="name@company.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-bold outline-none transition-all duration-300 placeholder:text-slate-300 placeholder:font-medium focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/5 hover:border-slate-300"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Password
              </label>
              {mode === "login" && (
                <Link href="#" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                  Reset
                </Link>
              )}
            </div>
            <div className="relative group/field">
              <input
                ref={passwordRef}
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 py-3 text-[13px] font-bold outline-none transition-all duration-300 placeholder:text-slate-300 placeholder:font-medium focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/5 hover:border-slate-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div className="space-y-1.5">
              <label htmlFor="role" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Workspace Role
              </label>
              <div className="relative group/field">
                <select
                  id="role"
                  name="role"
                  defaultValue="MEMBER"
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-bold outline-none transition-all duration-300 hover:border-slate-300 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/5 cursor-pointer"
                >
                  <option value="MEMBER">Project Member</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-[13px] font-black text-white shadow-xl shadow-slate-900/10 transition-all duration-300 hover:bg-black hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </span>
              ) : (
                <>
                  <span>{mode === "login" ? "Enter Dashboard" : "Create Workspace"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-100 p-3 text-[11px] font-bold text-rose-600 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
             <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
             {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[11px] font-bold text-emerald-600 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
             <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
             {success}
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col items-center gap-8">
          <p className="text-[12px] font-bold text-slate-400">
            {mode === "login" ? "New to TeamOps?" : "Have an account?"}{" "}
            <Link
              href={mode === "login" ? "/signup" : "/login"}
              className="text-indigo-600 transition-colors hover:text-indigo-700 font-black"
            >
              {mode === "login" ? "Create Account" : "Log In"}
            </Link>
          </p>

          {mode === "login" && (
            <div className="w-full">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-[1px] bg-slate-100" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] whitespace-nowrap">Rapid Access</span>
                <div className="flex-1 h-[1px] bg-slate-100" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleDemoFill("admin@example.com", "Admin@123")}
                  type="button" 
                  className="group/demo flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-600 transition-all duration-300 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/10 active:scale-95"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 group-hover/demo:scale-125 transition-transform" />
                  ADMIN
                </button>
                <button 
                  onClick={() => handleDemoFill("member@example.com", "Member@123")}
                  type="button" 
                  className="group/demo flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-600 transition-all duration-300 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50 active:scale-95"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400 group-hover/demo:bg-slate-900 group-hover/demo:scale-125 transition-transform" />
                  MEMBER
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
