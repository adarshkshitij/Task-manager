import { Role, TaskStatus } from "@prisma/client";
import { jsonError, jsonSuccess } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized.", 401);
  }

  const projectWhere =
    session.user.role === Role.ADMIN
      ? {}
      : {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        };

  const taskWhere =
    session.user.role === Role.ADMIN
      ? {}
      : {
          assignedToId: session.user.id,
        };

  const [projectCount, totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
    prisma.project.count({ where: projectWhere }),
    prisma.task.count({ where: taskWhere }),
    prisma.task.count({ where: { ...taskWhere, status: TaskStatus.DONE } }),
    prisma.task.count({ where: { ...taskWhere, status: TaskStatus.IN_PROGRESS } }),
    prisma.task.count({
      where: {
        ...taskWhere,
        dueDate: { lt: new Date() },
        status: { not: TaskStatus.DONE },
      },
    }),
  ]);

  return jsonSuccess({
    projectCount,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
  });
}
