import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function canAccessProject(userId: string, role: Role, projectId: string) {
  if (role === Role.ADMIN) {
    return true;
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  return Boolean(membership);
}
