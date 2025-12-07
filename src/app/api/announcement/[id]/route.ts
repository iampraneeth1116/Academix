import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Helper → unwrap Next.js 14/15 params safely
async function getParams(context: any) {
  return typeof context.params?.then === "function"
    ? await context.params
    : context.params;
}

// ================= UPDATE ANNOUNCEMENT ================= //
export async function PUT(req: NextRequest, context: any) {
  try {
    const { id } = await getParams(context); // <--- FIXED ✔
    const body = await req.json();

    const updated = await prisma.announcement.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        classId: body.classId ? Number(body.classId) : null,
      },
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (err) {
    console.error("Announcement UPDATE error:", err);
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 }
    );
  }
}

// ================= DELETE ANNOUNCEMENT ================= //
export async function DELETE(req: NextRequest, context: any) {
  try {
    const { id } = await getParams(context); // <--- FIXED ✔

    await prisma.announcement.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Announcement DELETE error:", err);
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
