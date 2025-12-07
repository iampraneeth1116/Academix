// app/api/result/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const created = await prisma.result.create({
      data: {
        studentId: body.studentId,
        score: Number(body.score),
        examId: body.examId || null,
        assignmentId: body.assignmentId || null,
      },
    });

    return NextResponse.json({ success: true, result: created });
  } catch (err) {
    console.error("RESULT CREATE ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
