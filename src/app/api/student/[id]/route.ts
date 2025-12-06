// app/api/student/[id]/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/* ------------------------ PUT (Update Student) ------------------------ */
export async function PUT(
  req: NextRequest,
  context:
    | { params: { id: string } }
    | { params: Promise<{ id: string }> }
) {
  try {
    // Unwrap Next.js Promise params
    const resolved =
      typeof (context.params as any)?.then === "function"
        ? await (context.params as any)
        : context.params;

    const id = resolved.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json();

    const updateData: any = {
      username: body.username,
      name: body.name,
      surname: body.surname,
      email: body.email,
      phone: body.phone,
      address: body.address,
      img: body.img,
      bloodType: body.bloodType,
      sex: body.sex,
      birthday: body.birthday ? new Date(body.birthday) : undefined,
      classId: body.classId ? Number(body.classId) : undefined,
      gradeId: body.gradeId ? Number(body.gradeId) : undefined,
    };

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(student);
  } catch (e: any) {
    console.error("Update student error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ------------------------ DELETE Student ------------------------ */
export async function DELETE(
  req: NextRequest,
  context:
    | { params: { id: string } }
    | { params: Promise<{ id: string }> }
) {
  try {
    // unwrap params
    const resolved =
      typeof (context.params as any)?.then === "function"
        ? await (context.params as any)
        : context.params;

    const id = resolved.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.student.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    console.error("Delete student error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
