import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { SettingsClient } from "@/components/settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      emailNotifications: true,
      desktopNotifications: true,
      systemActivityNotifications: true,
      theme: true,
      role: true,
    }
  });

  if (!user) return null;

  return <SettingsClient user={user} />;
}


