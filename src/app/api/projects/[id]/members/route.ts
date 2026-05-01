import { Role } from "@prisma/client";
import { ZodError } from "zod";
import { InvalidJsonBodyError, jsonError, jsonSuccess, formatZodError, readJsonBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { projectMemberSchema } from "@/lib/schemas";
import { getSession } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session?.user) {
    return jsonError("Unauthorized.", 401);
  }

  if (session.user.role !== Role.ADMIN) {
    return jsonError("Forbidden.", 403);
  }

  try {
    const { id } = await params;
    const body = await readJsonBody(request);
    const data = projectMemberSchema.parse(body);

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return jsonError("Project not found.", 404);
    }

    const existingMembership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: data.userId,
        },
      },
    });

    if (existingMembership) {
      return jsonError("User is already a member of this project.", 409);
    }

    const membership = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: data.userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return jsonSuccess({ membership, message: "Member added successfully." }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(formatZodError(error), 422);
    }

    if (error instanceof InvalidJsonBodyError) {
      return jsonError(error.message, 400);
    }

    console.error(error);
    return jsonError("Unable to add member.", 500);
  }
}
