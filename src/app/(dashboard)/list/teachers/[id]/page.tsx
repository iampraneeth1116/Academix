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

const SingleStudentPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  // ---------------- AUTH ---------------- //
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "GUEST" = "GUEST";

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      role = decoded.role || "GUEST";
    } catch {}
  }

  // ---------------- FETCH STUDENT ---------------- //
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          _count: {
            select: { lessons: true },
          },
        },
      },
      grade: true,
    },
  });

  if (!student) return notFound();

  return (
    <div className="flex-1 p-4 flex flex-col gap-6 xl:flex-row bg-gray-50">

      {/* LEFT SECTION */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">

        {/* TOP SECTION */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* STUDENT CARD */}
          <div className="bg-white shadow-sm p-6 rounded-md flex-1 flex gap-6">

            <Image
              src={student.img || "/noAvatar.png"}
              alt="Student Image"
              width={140}
              height={140}
              className="rounded-full object-cover border w-[140px] h-[140px]"
            />

            <div className="flex flex-col justify-between flex-1">

              {/* NAME + EDIT BUTTON */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                  {student.name} {student.surname}
                </h1>

                {role === "ADMIN" && (
                  <FormContainer
                    table="student"
                    type="update"
                    data={student}
                    currentUserId={student.id}
                  />
                )}
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Enrolled Student • Active Learner
              </p>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={16} height={16} />
                  <span>{student.bloodType}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Image src="/date.png" alt="" width={16} height={16} />
                  <span>{new Intl.DateTimeFormat("en-GB").format(student.birthday)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={16} height={16} />
                  <span>{student.email || "-"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={16} height={16} />
                  <span>{student.phone || "-"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Image src="/singleClass.png" alt="" width={16} height={16} />
                  <span>Class: {student.class.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Image src="/singleBranch.png" alt="" width={16} height={16} />
                  <span>Grade: {student.grade.level}th</span>
                </div>
              </div>
            </div>
          </div>

          {/* SMALL STATS CARDS */}
          <div className="flex flex-col md:flex-row lg:flex-col gap-4 w-full lg:w-[35%]">

            {/* Attendance */}
            <div className="bg-white shadow-sm p-4 rounded-md flex items-center gap-4">
              <Image src="/singleAttendance.png" width={28} height={28} alt="" />
              <Suspense fallback={<span>Loading...</span>}>
                <StudentAttendanceCard id={student.id} />
              </Suspense>
            </div>

            {/* Lessons */}
            <div className="bg-white shadow-sm p-4 rounded-md flex items-center gap-4">
              <Image src="/singleLesson.png" width={28} height={28} alt="" />
              <div>
                <h1 className="text-xl font-semibold">
                  {student.class._count.lessons}
                </h1>
                <span className="text-gray-500 text-sm">Lessons</span>
              </div>
            </div>

            {/* Class */}
            <div className="bg-white shadow-sm p-4 rounded-md flex items-center gap-4">
              <Image src="/singleClass.png" width={28} height={28} alt="" />
              <div>
                <h1 className="text-xl font-semibold">{student.class.name}</h1>
                <span className="text-gray-500 text-sm">Class</span>
              </div>
            </div>

            {/* Grade */}
            <div className="bg-white shadow-sm p-4 rounded-md flex items-center gap-4">
              <Image src="/singleBranch.png" width={28} height={28} alt="" />
              <div>
                <h1 className="text-xl font-semibold">{student.grade.level}th</h1>
                <span className="text-gray-500 text-sm">Grade</span>
              </div>
            </div>
          </div>
        </div>

        {/* CALENDAR SECTION */}
        <div className="bg-white shadow-sm rounded-md p-6">
          <h1 className="text-lg font-semibold mb-4">Student&apos;s Schedule</h1>
          <BigCalendarContainer type="classId" id={student.classId} />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">

        {/* SHORTCUT BUTTONS */}
        <div className="bg-white shadow-sm p-6 rounded-md">
          <h1 className="text-lg font-semibold">Shortcuts</h1>

          <div className="mt-4 flex flex-col gap-3 text-sm">

            <Link className="p-3 rounded-md bg-aSkyLight" href={`/list/lessons?classId=${student.classId}`}>
              Student&apos;s Lessons
            </Link>

            <Link className="p-3 rounded-md bg-aPurpleLight" href={`/list/teachers?classId=${student.classId}`}>
              Student&apos;s Teachers
            </Link>

            <Link className="p-3 rounded-md bg-pink-100" href={`/list/exams?classId=${student.classId}`}>
              Student&apos;s Exams
            </Link>

            <Link className="p-3 rounded-md bg-aSkyLight" href={`/list/assignments?classId=${student.classId}`}>
              Student&apos;s Assignments
            </Link>

            <Link className="p-3 rounded-md bg-aYellowLight" href={`/list/results?studentId=${student.id}`}>
              Student&apos;s Results
            </Link>
          </div>
        </div>

        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;
