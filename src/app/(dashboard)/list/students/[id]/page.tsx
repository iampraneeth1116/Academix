// app/(dashboard)/list/students/[id]/page.tsx
import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense } from "react";

export default async function SingleStudentPage({ params }: any) {
  const resolved = typeof params.then === "function" ? await params : params;
  const id = resolved.id;

  if (!id) return notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let role = "GUEST";
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      role = decoded.role || "GUEST";
    } catch {}
  }

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: { include: { _count: { select: { lessons: true } } } },
      grade: true,
    },
  });

  if (!student) return notFound();

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 xl:flex-row bg-gray-50">

      {/* LEFT SIDE */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">

        {/* ---------------- PROFILE + STATS ---------------- */}
        <div className="flex flex-col lg:flex-row gap-6">
{/* ================= PROFILE CARD (FIXED UI) ================= */}
<div className="bg-white rounded-2xl shadow-sm p-6 flex-1 border border-gray-100">

  <div className="flex gap-6 items-start">

    {/* AVATAR */}
    <div className="flex flex-col items-center">
      <Image
        src={student.img || "/noAvatar.png"}
        alt=""
        width={130}
        height={130}
        className="w-[130px] h-[130px] rounded-full object-cover border-2 border-gray-200 shadow-sm"
      />
      <p className="text-xs text-gray-400 mt-2 italic">Student Profile</p>
    </div>

    {/* RIGHT SIDE CONTENT */}
    <div className="flex flex-col flex-1">

      {/* NAME + EDIT BUTTON */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 leading-tight">
            {student.name} {student.surname}
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            ID: {student.id}
          </p>
        </div>

        {role === "ADMIN" && (
          <div className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer">
            <FormContainer table="student" type="update" data={student} />
          </div>
        )}
      </div>

      {/* INFO GRID */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-1 gap-3">

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Image src="/blood.png" width={16} height={16} alt="" />
          <span className="font-medium text-gray-700">{student.bloodType}</span>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Image src="/date.png" width={16} height={16} alt="" />
          <span className="font-medium text-gray-700">
            {new Intl.DateTimeFormat("en-GB").format(student.birthday)}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 overflow-hidden">
          <Image src="/mail.png" width={16} height={16} alt="" />
          <span className="font-medium text-gray-700 truncate">
            {student.email || "-"}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Image src="/phone.png" width={16} height={16} alt="" />
          <span className="font-medium text-gray-700">{student.phone || "-"}</span>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Image src="/singleClass.png" width={16} height={16} alt="" />
          <span className="font-medium text-gray-700">
            Class: {student.class.name}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Image src="/singleBranch.png" width={16} height={16} alt="" />
          <span className="font-medium text-gray-700">
            Grade: {student.grade.level}th
          </span>
        </div>

      </div>
    </div>
  </div>
</div>


          {/* ================= STATS CARDS ================= */}
          <div className="flex-1 grid grid-cols-1 gap-4">

            {/* Attendance */}
            <div className="bg-white rounded-xl shadow p-5 flex gap-4 items-center border border-gray-100 hover:shadow-lg transition">
              <Image src="/singleAttendance.png" width={28} height={28} alt="" />
              <Suspense fallback="loading...">
                <StudentAttendanceCard id={student.id} />
              </Suspense>
            </div>

            {/* Grade */}
            <div className="bg-white rounded-xl shadow p-5 flex gap-4 items-center border border-gray-100 hover:shadow-lg transition">
              <Image src="/singleBranch.png" width={28} height={28} alt="" />
              <div>
                <h1 className="text-xl font-semibold">{student.grade.level}th</h1>
                <p className="text-gray-500 text-xs">Grade</p>
              </div>
            </div>

            {/* Lessons */}
            <div className="bg-white rounded-xl shadow p-5 flex gap-4 items-center border border-gray-100 hover:shadow-lg transition">
              <Image src="/singleLesson.png" width={28} height={28} alt="" />
              <div>
                <h1 className="text-xl font-semibold">{student.class._count.lessons}</h1>
                <p className="text-gray-500 text-xs">Lessons</p>
              </div>
            </div>

            {/* Class */}
            <div className="bg-white rounded-xl shadow p-5 flex gap-4 items-center border border-gray-100 hover:shadow-lg transition">
              <Image src="/singleClass.png" width={28} height={28} alt="" />
              <div>
                <h1 className="text-xl font-semibold">{student.class.name}</h1>
                <p className="text-gray-500 text-xs">Class</p>
              </div>
            </div>

          </div>
        </div>

        {/* ================= CALENDAR ================= */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 h-[800px]">
          <h1 className="font-semibold text-lg mb-3 text-gray-800">Student’s Schedule</h1>
          <BigCalendarContainer type="classId" id={student.classId} />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">

        {/* Shortcuts */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h1 className="text-lg font-semibold text-gray-800">Shortcuts</h1>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link className="p-3 rounded-md bg-aSkyLight hover:brightness-95 transition" href={`/list/lessons?classId=${student.classId}`}>
              Student's Lessons
            </Link>

            <Link className="p-3 rounded-md bg-aPurpleLight hover:brightness-95 transition" href={`/list/teachers?classId=${student.classId}`}>
              Student's Teachers
            </Link>

            <Link className="p-3 rounded-md bg-pink-100 hover:brightness-95 transition" href={`/list/exams?classId=${student.classId}`}>
              Student's Exams
            </Link>

            <Link className="p-3 rounded-md bg-aSkyLight hover:brightness-95 transition" href={`/list/assignments?classId=${student.classId}`}>
              Student's Assignments
            </Link>

            <Link className="p-3 rounded-md bg-aYellowLight hover:brightness-95 transition" href={`/list/results?studentId=${student.id}`}>
              Student's Results
            </Link>
          </div>

        </div>

        <Performance />
        <Announcements />
      </div>
    </div>
  );
}
