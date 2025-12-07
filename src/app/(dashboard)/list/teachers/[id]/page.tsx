// app/(dashboard)/list/teachers/[id]/page.tsx

import prisma from "@/lib/prisma";
import Image from "next/image";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import Announcements from "@/components/Announcements";

// ---------------- JWT AUTH ---------------- //
async function getUserFromJWT() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch {
    return null;
  }
}

export default async function SingleTeacherPage({ params }: any) {
  const resolved = typeof params.then === "function" ? await params : params;
  const id = resolved.id;

  if (!id) return notFound();

  const user = await getUserFromJWT();
  const role: string = user?.role?.toUpperCase() ?? "GUEST";

  // Fetch teacher + subjects + classes + lessons
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      teacherSubjects: {
        include: { subject: true },
      },
      classes: true,
      lessons: {
        include: {
          class: true,
          subject: true,
        },
      },
    },
  });

  if (!teacher) return notFound();

  const subjects = teacher.teacherSubjects.map((ts) => ts.subject);
  const classes = teacher.classes;
  const lessons = teacher.lessons;

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 xl:flex-row bg-gray-50">

      {/* LEFT SIDE (2/3 width) */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">

        {/* ---------------- PROFILE CARD ---------------- */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex gap-6 border border-gray-100">

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <Image
              src={teacher.img || "/noAvatar.png"}
              alt=""
              width={130}
              height={130}
              className="rounded-full w-[130px] h-[130px] object-cover border shadow"
            />
            <p className="text-xs text-gray-400 mt-2 italic">Teacher Profile</p>
          </div>

          {/* Right content */}
          <div className="flex flex-col flex-1">

            {/* Name + Edit */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-gray-800">
                  {teacher.name} {teacher.surname}
                </h1>
                <p className="text-sm text-gray-500">{teacher.username}</p>
              </div>

              {role === "ADMIN" && (
                <div className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition">
                  <FormContainer table="teacher" type="update" data={teacher} />
                </div>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 text-gray-700">

              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <Image src="/mail.png" width={16} height={16} alt="" />
                <span>{teacher.email || "-"}</span>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <Image src="/phone.png" width={16} height={16} alt="" />
                <span>{teacher.phone || "-"}</span>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <Image src="/singleBranch.png" width={16} height={16} alt="" />
                <span>{teacher.address}</span>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <Image src="/blood.png" width={16} height={16} alt="" />
                <span>{teacher.bloodType}</span>
              </div>

            </div>
          </div>
        </div>

        {/* ---------------- STATS CARDS ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Subjects Count */}
          <div className="bg-white border rounded-xl shadow p-5 flex gap-4 items-center hover:shadow-lg transition">
            <Image src="/singleLesson.png" width={28} height={28} alt="" />
            <div>
              <h1 className="text-xl font-semibold">{subjects.length}</h1>
              <p className="text-gray-500 text-xs">Subjects Taught</p>
            </div>
          </div>

          {/* Classes Count */}
          <div className="bg-white border rounded-xl shadow p-5 flex gap-4 items-center hover:shadow-lg transition">
            <Image src="/singleClass.png" width={28} height={28} alt="" />
            <div>
              <h1 className="text-xl font-semibold">{classes.length}</h1>
              <p className="text-gray-500 text-xs">Classes Supervised</p>
            </div>
          </div>

          {/* Lessons Count */}
          <div className="bg-white border rounded-xl shadow p-5 flex gap-4 items-center hover:shadow-lg transition">
            <Image src="/singleAttendance.png" width={28} height={28} alt="" />
            <div>
              <h1 className="text-xl font-semibold">{lessons.length}</h1>
              <p className="text-gray-500 text-xs">Lessons</p>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white border rounded-xl shadow p-5 flex gap-4 items-center hover:shadow-lg transition">
            <Image src="/singleBranch.png" width={28} height={28} alt="" />
            <div>
              <h1 className="text-xl font-semibold">
                {new Date().getFullYear() - 2020}+ yrs
              </h1>
              <p className="text-gray-500 text-xs">Experience</p>
            </div>
          </div>

        </div>

        {/* ---------------- LESSONS TABLE ---------------- */}
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h1 className="text-lg font-semibold mb-4">Lessons Taught</h1>

          <div className="flex flex-col gap-3">
            {lessons.map((l) => (
              <div
                key={l.id}
                className="p-4 bg-gray-50 rounded-lg border flex justify-between"
              >
                <span className="font-medium">{l.name}</span>
                <span className="text-gray-500 text-sm">
                  {l.subject.name} • {l.class.name}
                </span>
              </div>
            ))}

            {lessons.length === 0 && (
              <p className="text-gray-500 text-sm">No lessons assigned.</p>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT SIDE (1/3 width) */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">

        {/* ---------------- SHORTCUTS ---------------- */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h1 className="text-lg font-semibold text-gray-800">Shortcuts</h1>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link
              href={`/list/lessons?teacherId=${teacher.id}`}
              className="p-3 rounded-md bg-aSkyLight hover:brightness-95 transition"
            >
              Teacher's Lessons
            </Link>

            <Link
              href={`/list/exams?teacherId=${teacher.id}`}
              className="p-3 rounded-md bg-aPurpleLight hover:brightness-95 transition"
            >
              Teacher's Exams
            </Link>

            <Link
              href={`/list/assignments?teacherId=${teacher.id}`}
              className="p-3 rounded-md bg-pink-100 hover:brightness-95 transition"
            >
              Teacher's Assignments
            </Link>

            <Link
              href={`/list/results?teacherId=${teacher.id}`}
              className="p-3 rounded-md bg-aYellowLight hover:brightness-95 transition"
            >
              Student Results (Teacher)
            </Link>
          </div>
        </div>

        <Performance />
        <Announcements />

      </div>
    </div>
  );
}
