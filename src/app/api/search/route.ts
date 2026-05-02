import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { jsonSuccess, jsonError } from "@/lib/api";

export async function GET(request: Request) {
  const session = await getSession();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!session?.user) {
    return jsonError("Unauthorized", 401);
  }

  if (!query) {
    return jsonSuccess({ projects: [], tasks: [] });
  }

  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        members: { some: { userId: session.user.id } },
      },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
          {
            OR: [
              { assignedToId: session.user.id },
              { createdById: session.user.id },
              { project: { members: { some: { userId: session.user.id } } } },
            ],
          },
        ],
      },
      take: 5,
    }),
  ]);

  return jsonSuccess({ projects, tasks });
}
