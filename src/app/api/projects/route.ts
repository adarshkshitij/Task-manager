import { Role } from "@prisma/client";
import { ZodError } from "zod";
import { InvalidJsonBodyError, jsonError, jsonSuccess, formatZodError, readJsonBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/schemas";
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
          members: {
            some: {
              userId: session.user.id,
            },
          },
        };

  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          members: true,
          tasks: true,
        },
      },
    },
  });

  return jsonSuccess({ projects });
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized.", 401);
  }

  if (session.user.role !== Role.ADMIN) {
    return jsonError("Forbidden.", 403);
  }

  try {
    const body = await readJsonBody(request);
    const data = projectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    return jsonSuccess({ project, message: "Project created successfully." }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(formatZodError(error), 422);
    }

    if (error instanceof InvalidJsonBodyError) {
      return jsonError(error.message, 400);
    }

    console.error(error);
    return jsonError("Unable to create project.", 500);
  }
}
