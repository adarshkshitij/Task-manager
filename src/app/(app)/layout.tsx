import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/session";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();

  return <AppShell userName={session.user.name ?? "User"} role={session.user.role}>{children}</AppShell>;
}
