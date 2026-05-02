import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { jsonSuccess, jsonError } from "@/lib/api";

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized", 401);
  }

  // Members can see logs for projects they are in, Admins see all logs
  const logs = await prisma.activityLog.findMany({
    where: session.user.role === "ADMIN" ? {} : {
      OR: [
        { userId: session.user.id },
        { projectId: { in: (await prisma.projectMember.findMany({ where: { userId: session.user.id }, select: { projectId: true } })).map(m => m.projectId) } }
      ]
    },
    include: {
      user: {
        select: {
          name: true,
          role: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return jsonSuccess(logs);
}
