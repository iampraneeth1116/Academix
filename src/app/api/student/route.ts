// app/api/student/route.ts
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Generate id if not provided (use Node's crypto)
    const id = body.id || (typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `s_${Date.now()}`);

    // Validate minimal fields (you can extend)
    if (!body.username || !body.name) {
      return new Response("Missing required fields", { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        id,
        username: body.username,
        name: body.name,
        surname: body.surname ?? "",
        email: body.email ?? null,
        phone: body.phone ?? null,
        address: body.address ?? "",
        img: body.img ?? null,
        bloodType: body.bloodType ?? "",
        sex: body.sex ?? "MALE",
        parentId: body.parentId ?? "", // adjust if required
        classId: body.classId ? parseInt(body.classId) : body.classId,
        gradeId: body.gradeId ? parseInt(body.gradeId) : body.gradeId,
        birthday: body.birthday ? new Date(body.birthday) : new Date(),
      },
    });

    return new Response(JSON.stringify(student), { status: 201 });
  } catch (e: any) {
    console.error("Create student error:", e);
    return new Response(String(e.message || e), { status: 500 });
  }
}
