import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const data = await req.json();

    const allowedFields = [
      "emailNotifications",
      "desktopNotifications",
      "systemActivityNotifications",
      "theme"
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
