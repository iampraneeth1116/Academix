import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// helper to unwrap params safely (works in Next 13/14/15)
async function unwrapParams(context: any) {
  const p = context.params;
  return typeof p?.then === "function" ? await p : p;
}

// ---------------- UPDATE RESULT ---------------- //
export async function PUT(req: NextRequest, context: any) {
  try {
    const { id } = await unwrapParams(context);

    const body = await req.json();

    const updated = await prisma.result.update({
      where: { id: Number(id) },
      data: {
        score: Number(body.score),
        studentId: body.studentId,
        examId: body.examId || null,
        assignmentId: body.assignmentId || null,
      },
    });

    return NextResponse.json({ success: true, result: updated });

  } catch (err) {
    console.error("Result UPDATE error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// ---------------- DELETE RESULT ---------------- //
export async function DELETE(req: NextRequest, context: any) {
  try {
    const { id } = await unwrapParams(context);

    await prisma.result.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Result DELETE error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
