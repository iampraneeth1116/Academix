import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: any) {
  try {
    const body = await req.json();
    await prisma.exam.update({
      where: { id: Number(params.id) },
      data: {
        title: body.title,
        startTime: body.startTime,
        endTime: body.endTime,
        lessonId: body.lessonId,
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.log("UPDATE EXAM ERROR:", err);
    return Response.json({ error: true }, { status: 500 });
  }
}
