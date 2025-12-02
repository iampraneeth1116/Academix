import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

const SingleTeacherPage = async ({ params: { id } }: { params: { id: string } }) => {
  // ============================
  // JWT AUTH
  // ============================
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "GUEST" = "GUEST";

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      role = decoded.role || "GUEST";
    } catch {
      role = "GUEST";
    }
  }

  // ============================
  // TEACHER FETCH
  // ============================
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          teacherSubjects: true,
          lessons: true,
          classes: true,
        },
      },
    },
  });

  if (!teacher) return notFound();

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={teacher.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>

            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {teacher.name} {teacher.surname}
                </h1>

                {role === "ADMIN" && (
                  <FormContainer table="teacher" type="update" data={teacher} />
                )}
              </div>

              <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet.</p>

              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>{teacher.bloodType}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{teacher.email || "-"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{teacher.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">

            {/* Attendance */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%]">
              <Image src="/singleAttendance.png" width={24} height={24} alt="" />
              <div>
                <h1 className="text-xl font-semibold">90%</h1>
                <span className="text-sm text-gray-400">Attendance</span>
              </div>
            </div>

            {/* Subjects */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%]">
              <Image src="/singleBranch.png" width={24} height={24} alt="" />
              <div>
                <h1 className="text-xl font-semibold">
                  {teacher._count.teacherSubjects}
                </h1>
                <span className="text-sm text-gray-400">Subjects</span>
              </div>
            </div>

            {/* Lessons */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%]">
              <Image src="/singleLesson.png" width={24} height={24} alt="" />
              <div>
                <h1 className="text-xl font-semibold">{teacher._count.lessons}</h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>

            {/* Classes */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%]">
              <Image src="/singleClass.png" width={24} height={24} alt="" />
              <div>
                <h1 className="text-xl font-semibold">{teacher._count.classes}</h1>
                <span className="text-sm text-gray-400">Classes</span>
              </div>
            </div>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1>Teacher&apos;s Schedule</h1>
          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>

          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link className="p-3 rounded-md bg-lamaSkyLight" href={`/list/classes?supervisorId=${teacher.id}`}>
              Teacher&apos;s Classes
            </Link>
            <Link className="p-3 rounded-md bg-lamaPurpleLight" href={`/list/students?teacherId=${teacher.id}`}>
              Teacher&apos;s Students
            </Link>
            <Link className="p-3 rounded-md bg-lamaYellowLight" href={`/list/lessons?teacherId=${teacher.id}`}>
              Teacher&apos;s Lessons
            </Link>
            <Link className="p-3 rounded-md bg-pink-50" href={`/list/exams?teacherId=${teacher.id}`}>
              Teacher&apos;s Exams
            </Link>
            <Link className="p-3 rounded-md bg-lamaSkyLight" href={`/list/assignments?teacherId=${teacher.id}`}>
              Teacher&apos;s Assignments
            </Link>
          </div>
        </div>

        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleTeacherPage;
