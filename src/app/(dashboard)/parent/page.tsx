import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ParentPage = async () => {

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let parentId: string | null = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

      if (decoded.role === "PARENT") {
        parentId = decoded.userId;
      }
    } catch (err) {
      parentId = null;
    }
  }

  if (!parentId) {
    return (
      <div className="p-6 text-red-500 font-semibold">
        Unauthorized: Parent account required.
      </div>
    );
  }


  const students = await prisma.student.findMany({
    where: { parentId },
    include: {
      class: true,
    },
  });

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="flex flex-col gap-6 w-full xl:w-2/3">
        {students.map((student) => (
          <div className="w-full bg-white p-4 rounded-md" key={student.id}>
            <h1 className="text-xl font-semibold">
              Schedule ({student.name} {student.surname})
            </h1>

            <BigCalendarContainer type="classId" id={student.classId} />
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
