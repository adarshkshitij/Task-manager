import { Role } from "@prisma/client";
import { jsonError, jsonSuccess } from "@/lib/api";
import { canAccessProject } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized.", 401);
  }

  const { id } = await params;

  const allowed = await canAccessProject(session.user.id, session.user.role as Role, id);

  if (!allowed) {
    return jsonError("Forbidden.", 403);
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      tasks: {
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    return jsonError("Project not found.", 404);
  }

  return jsonSuccess({ project });
}
