import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    // Support both: params OR Promise<params>
    const resolved = typeof (context.params as any)?.then === "function"
      ? await (context.params as any)
      : context.params;

    const id = Number(resolved.id);

    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete class error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
