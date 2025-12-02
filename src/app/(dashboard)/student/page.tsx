// import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
// import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const StudentPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let studentId: string | null = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      if (decoded.role === "STUDENT") studentId = decoded.userId;
    } catch (err) {
      studentId = null;
    }
  }

  if (!studentId) {
    return (
      <div className="p-6 text-red-500 font-semibold">
        Unauthorized: Student account required.
      </div>
    );
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true },
  });

  if (!student) {
    return (
      <div className="p-6 text-red-500 font-semibold">
        Student not found.
      </div>
    );
  }

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">
            Schedule ({student.class.name})
          </h1>
          <BigCalendarContainer type="classId" id={student.classId} />
        </div>
      </div>

      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        {/* <EventCalendar classId={student.classId} />
        <Announcements classId={student.classId} /> */}

      </div>
    </div>
  );
};

export default StudentPage;
