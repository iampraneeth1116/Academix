import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const lesson = await prisma.lesson.create({
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
    console.error("Lesson create error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
