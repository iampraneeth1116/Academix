import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // -----------------------------
    // 1️⃣ Validate class & grade
    // -----------------------------
    const cls = await prisma.class.findUnique({
      where: { id: Number(body.classId) },
    });

    const grade = await prisma.grade.findUnique({
      where: { id: Number(body.gradeId) },
    });

    if (!cls)
      return NextResponse.json({ error: "Class not found" }, { status: 400 });

    if (!grade)
      return NextResponse.json({ error: "Grade not found" }, { status: 400 });

    // -----------------------------
    // 2️⃣ Get default parent
    // -----------------------------
    const defaultParent = await prisma.parent.findFirst();

    if (!defaultParent) {
      return NextResponse.json(
        { error: "A parent record is required but none exists." },
        { status: 400 }
      );
    }

    // -----------------------------
    // 3️⃣ Create student
    // -----------------------------
    const student = await prisma.student.create({
      data: {
        id: randomUUID(),
        username: body.username,
        name: body.firstName,
        surname: body.lastName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        bloodType: body.bloodType,
        sex: body.sex,
        birthday: new Date(body.birthday),
        classId: Number(body.classId),
        gradeId: Number(body.gradeId),
        parentId: defaultParent.id, // ✅ REQUIRED FIX
      },
    });

    // -----------------------------
    // 4️⃣ Create student login
    // -----------------------------
    await prisma.userLogin.create({
      data: {
        username: body.username,
        password: body.password,
        role: "STUDENT",
        userId: student.id,
        userType: "STUDENT",
      },
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.log("CREATE STUDENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
