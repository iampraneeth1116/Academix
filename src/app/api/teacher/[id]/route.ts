// app/api/teacher/[id]/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id?: string }> }) {
  try {
    // IMPORTANT: params is a Promise in Next.js dynamic API routes — await it.
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    // delete by id (your schema uses String ids)
    const deleted = await prisma.teacher.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted }, { status: 200 });
  } catch (error: any) {
    // Prisma known-not-found error code when trying to delete a non-existent record
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    console.error("Delete teacher error:", error);
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}
