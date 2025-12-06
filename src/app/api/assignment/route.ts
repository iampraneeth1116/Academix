import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newAssignment = await prisma.assignment.create({
      data: {
        title: body.title,
        startDate: new Date(body.startDate),
        dueDate: new Date(body.dueDate),
        lessonId: Number(body.lessonId),
      },
    });

    return Response.json(newAssignment);
  } catch (err) {
    console.error("Create assignment error", err);
    return new Response("Error", { status: 500 });
  }
}
