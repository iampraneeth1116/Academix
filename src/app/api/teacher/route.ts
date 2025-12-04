import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      bloodType,
      birthday,
      sex,
      img,
      subjectId,
      classId,
    } = body;

    // Create Teacher
    const teacher = await prisma.teacher.create({
      data: {
        id: crypto.randomUUID(),
        username,
        name: firstName,
        surname: lastName,
        email,
        phone,
        address,
        bloodType,
        birthday: new Date(birthday),
        sex: sex.toUpperCase(),
        img: img || null,
      },
    });

    // Connect Subject (optional)
    if (subjectId) {
      await prisma.teacherSubject.create({
        data: {
          teacherId: teacher.id,
          subjectId: Number(subjectId),
        },
      });
    }

    // Assign teacher as supervisor of class (optional)
    if (classId) {
      await prisma.class.update({
        where: { id: Number(classId) },
        data: { supervisorId: teacher.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
