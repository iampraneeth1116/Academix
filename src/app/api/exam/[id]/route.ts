import prisma from "@/lib/prisma";

export async function DELETE(req: Request, ctx: any) {
  try {
    const resolved = await ctx.params;
    let id = resolved.id;

    if (!id) {
      return new Response("Missing exam ID", { status: 400 });
    }

    id = parseInt(id); // <-- FIX HERE

    await prisma.exam.delete({
      where: { id },
    });

    return new Response("Deleted", { status: 200 });
  } catch (err) {
    console.error("DELETE exam error:", err);
    return new Response("Error deleting exam", { status: 500 });
  }
}
