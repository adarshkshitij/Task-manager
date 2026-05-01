import { Role } from "@prisma/client";
import { jsonError, jsonSuccess } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized.", 401);
  }

  if (session.user.role !== Role.ADMIN) {
    return jsonError("Forbidden.", 403);
  }

  const { id, userId } = await params;

  const [project, membership, assignedTasksCount] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      select: { createdById: true },
    }),
    prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId,
        },
      },
    }),
    prisma.task.count({
      where: {
        projectId: id,
        assignedToId: userId,
      },
    }),
  ]);

  if (!project) {
    return jsonError("Project not found.", 404);
  }

  if (!membership) {
    return jsonError("Membership not found.", 404);
  }

  if (project.createdById === userId) {
    return jsonError("Project creator cannot be removed.", 409);
  }

  if (assignedTasksCount > 0) {
    return jsonError("Reassign or delete this member's tasks before removing them.", 409);
  }

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId: id,
        userId,
      },
    },
  });

  return jsonSuccess({ message: "Member removed successfully." });
}
