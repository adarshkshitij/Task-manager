import { Role } from "@prisma/client";
import { ZodError } from "zod";
import { InvalidJsonBodyError, jsonError, jsonSuccess, formatZodError, readJsonBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/schemas";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized.", 401);
  }

  const where =
    session.user.role === Role.ADMIN
      ? {}
      : {
          OR: [
            { assignedToId: session.user.id },
            { createdById: session.user.id },
          ],
        };

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: {
        select: { id: true, name: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  return jsonSuccess({ tasks });
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized.", 401);
  }

  try {
    const body = await readJsonBody(request);
    const data = taskSchema.parse(body);

    if (session.user.role !== Role.ADMIN) {
      const creatorMembership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: data.projectId,
            userId: session.user.id,
          },
        },
      });

      if (!creatorMembership) {
        return jsonError("Forbidden. You must belong to the project to create tasks.", 403);
      }
    }


    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: data.projectId,
          userId: data.assignedToId,
        },
      },
    });

    if (!membership) {
      return jsonError("Assignee must be a member of the selected project.", 422);
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        projectId: data.projectId,
        assignedToId: data.assignedToId,
        createdById: session.user.id,
      },
    });

    return jsonSuccess({ task, message: "Task created successfully." }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(formatZodError(error), 422);
    }

    if (error instanceof InvalidJsonBodyError) {
      return jsonError(error.message, 400);
    }

    console.error(error);
    return jsonError("Unable to create task.", 500);
  }
}
