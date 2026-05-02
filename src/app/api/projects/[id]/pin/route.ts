import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id: projectId } = await params;

    // Verify membership and toggle pinned status
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedMembership = await prisma.projectMember.update({
      where: {
        id: membership.id,
      },
      data: {
        pinned: !membership.pinned,
      },
    });

    return NextResponse.json({ pinned: updatedMembership.pinned });
  } catch (error) {
    console.error("Project pin error:", error);
    return NextResponse.json({ error: "Failed to pin project" }, { status: 500 });
  }
}
