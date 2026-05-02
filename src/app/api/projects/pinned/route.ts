import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await requireSession();

    const pinnedMemberships = await prisma.projectMember.findMany({
      where: {
        userId: session.user.id,
        pinned: true,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const pinnedProjects = pinnedMemberships.map((m) => ({
      id: m.project.id,
      name: m.project.name,
    }));

    return NextResponse.json(pinnedProjects);
  } catch (error) {
    console.error("Fetch pinned projects error:", error);
    return NextResponse.json({ error: "Failed to fetch pinned projects" }, { status: 500 });
  }
}
