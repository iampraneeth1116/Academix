import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// =================== UPDATE TEACHER =================== //
export async function PUT(
  req: NextRequest,
  context:
    | { params: { id: string } }
    | { params: Promise<{ id: string }> }
) {
  try {
    // unwrap params for Next.js 14/15
    const resolved =
      typeof (context.params as any)?.then === "function"
        ? await (context.params as any)
        : context.params;

    const id = resolved.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Build update payload
    const updateData: any = {
      username: body.username,
      email: body.email,
      name: body.name,
      surname: body.surname,
      phone: body.phone,
      address: body.address,
      bloodType: body.bloodType,
      birthday: new Date(body.birthday),
      sex: body.sex,
      img: body.img ?? null,
    };

    // If password supplied → update. If not → ignore.
    if (body.password) {
      updateData.password = body.password;
    }

    // Update teacher
    const updated = await prisma.teacher.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, teacher: updated });
  } catch (err) {
    console.error("Teacher UPDATE error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update teacher" },
      { status: 500 }
    );
  }
}

// =================== DELETE TEACHER =================== //
export async function DELETE(
  req: NextRequest,
  context:
    | { params: { id: string } }
    | { params: Promise<{ id: string }> }
) {
  try {
    const resolved =
      typeof (context.params as any)?.then === "function"
        ? await (context.params as any)
        : context.params;

    const id = resolved.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400 }
      );
    }

    // delete login first
    await prisma.userLogin.deleteMany({ where: { userId: id } });

    // delete teacher
    await prisma.teacher.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Teacher delete error:", err);

    return NextResponse.json(
      { success: false, error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
