import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { jsonSuccess, jsonError } from "@/lib/api";

export async function GET() {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    return jsonError("Forbidden", 403);
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          memberships: true,
          assignedTasks: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonSuccess(users);
}
