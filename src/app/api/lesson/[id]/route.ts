import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: any) {
  try {
    const body = await req.json();
    const id = Number(params.id);

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        name: body.name,
        day: body.day,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),

        subject: { connect: { id: Number(body.subjectId) } },
        class: { connect: { id: Number(body.classId) } },
        teacher: { connect: { id: body.teacherId } },
      },
    });

    return NextResponse.json({ success: true, lesson });
  } catch (err) {
    console.error("Lesson UPDATE error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    await prisma.lesson.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lesson DELETE error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
