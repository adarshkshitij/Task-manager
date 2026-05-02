import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { jsonSuccess, jsonError } from "@/lib/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await params;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification || notification.userId !== session.user.id) {
    return jsonError("Notification not found", 404);
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return jsonSuccess(updated);
}
