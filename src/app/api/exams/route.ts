import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await prisma.exam.create({
      data: {
        title: body.title,
        startTime: body.startTime,
        endTime: body.endTime,
        lessonId: body.lessonId,
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.log("CREATE EXAM ERROR:", err);
    return Response.json({ error: true }, { status: 500 });
  }
}
