import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_45%,_#ffffff_100%)] px-4">
      <div className="max-w-lg rounded-[32px] border border-white/60 bg-white/90 p-10 text-center shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)]">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-amber-600">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">This page could not be found</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The page may have moved, or the project/task you requested may no longer exist.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to dashboard
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            Open projects
          </Link>
        </div>
      </div>
    </div>
  );
}
