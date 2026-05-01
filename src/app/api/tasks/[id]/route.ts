import { Role } from "@prisma/client";
import { ZodError } from "zod";
import { InvalidJsonBodyError, jsonError, jsonSuccess, formatZodError, readJsonBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { taskSchema, taskStatusUpdateSchema } from "@/lib/schemas";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized.", 401);
  }

  try {
    const { id } = await params;
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return jsonError("Task not found.", 404);
    }

    const body = await readJsonBody(request);

    if (session.user.role === Role.ADMIN) {
      const data = taskSchema.partial().parse(body);

      if (data.assignedToId || data.projectId) {
        const membership = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId: data.projectId ?? existingTask.projectId,
              userId: data.assignedToId ?? existingTask.assignedToId,
            },
          },
        });

        if (!membership) {
          return jsonError("Assignee must belong to the selected project.", 422);
        }
      }

      const task = await prisma.task.update({
        where: { id },
        data,
      });

      return jsonSuccess({ task, message: "Task updated successfully." });
    }

    if (existingTask.assignedToId !== session.user.id) {
      return jsonError("Forbidden.", 403);
    }

    const data = taskStatusUpdateSchema.parse(body);
    const task = await prisma.task.update({
      where: { id },
      data: {
        status: data.status,
      },
    });

    return jsonSuccess({ task, message: "Task status updated." });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(formatZodError(error), 422);
    }

    if (error instanceof InvalidJsonBodyError) {
      return jsonError(error.message, 400);
    }

    console.error(error);
    return jsonError("Unable to update task.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized.", 401);
  }

  if (session.user.role !== Role.ADMIN) {
    return jsonError("Forbidden.", 403);
  }

  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    return jsonError("Task not found.", 404);
  }

  await prisma.task.delete({
    where: { id },
  });

  return jsonSuccess({ message: "Task deleted successfully." });
}
