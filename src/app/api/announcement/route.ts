import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// CREATE ANNOUNCEMENT
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const created = await prisma.announcement.create({
      data: {
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        classId: body.classId ? Number(body.classId) : null
      },
    });

    return NextResponse.json({ success: true, announcement: created });
  } catch (err) {
    console.error("Announcement CREATE error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
