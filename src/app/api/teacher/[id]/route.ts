// app/api/teacher/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context:
    | { params: { id: string } }
    | { params: Promise<{ id: string }> }
) {
  try {
    // Unwrap params if it's a Promise (Next.js 15 behavior)
    const resolved =
      typeof (context.params as any)?.then === "function"
        ? await (context.params as any)
        : context.params;

    const id = resolved.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400 }
      );
    }

    // delete login first
    await prisma.userLogin.deleteMany({
      where: { userId: id },
    });

    // delete teacher
    await prisma.teacher.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Teacher delete error:", err);

    return NextResponse.json(
      { success: false, error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
