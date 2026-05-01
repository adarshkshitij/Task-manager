export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.3),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.2),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#fff7ed_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:px-8">
        <div className="mb-10 hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-700">
            Full-Stack Assignment
          </p>
          <h2 className="mt-4 max-w-xl text-5xl font-semibold tracking-tight text-slate-950">
            Organize projects, assign work, and track delivery with role-based access.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
            This build includes authentication, project management, task assignment, progress tracking, and
            overdue visibility for both admins and members.
          </p>
        </div>
        <div className="w-full max-w-xl justify-self-end">{children}</div>
      </div>
    </div>
  );
}
