import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { jsonSuccess, jsonError } from "@/lib/api";

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized", 401);
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return jsonSuccess(notifications);
}

export async function POST() {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized", 401);
  }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return jsonSuccess({ message: "All notifications marked as read" });
}
