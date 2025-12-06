import prisma from "@/lib/prisma";

export async function PUT(req: Request, ctx: any) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const updated = await prisma.assignment.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        startDate: new Date(body.startDate),
        dueDate: new Date(body.dueDate),
        lessonId: Number(body.lessonId),
      },
    });

    return Response.json(updated);
  } catch (err) {
    console.error("Update assignment error:", err);
    return new Response("Error", { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: any) {
  try {
    const { id } = await ctx.params;

    await prisma.assignment.delete({
      where: { id: Number(id) },
    });

    return new Response("Deleted", { status: 200 });
  } catch (err) {
    console.error("Delete assignment error:", err);
    return new Response("Error", { status: 500 });
  }
}
