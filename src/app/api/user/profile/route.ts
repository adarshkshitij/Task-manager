import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
