import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const created = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        classId: body.classId ? Number(body.classId) : null,
      },
    });

    return NextResponse.json({ success: true, event: created });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
