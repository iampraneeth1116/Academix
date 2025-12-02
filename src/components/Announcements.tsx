import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const Announcements = async ({ classId }: { classId?: number }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let userId: string | null = null;
  let role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | null = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.userId;
      role = decoded.role;
    } catch (err) {
      userId = null;
      role = null;
    }
  }

  const roleConditions: any = {
    TEACHER: { classess: { some: { supervisorId: userId! } } },
    STUDENT: { students: { some: { id: userId! } } },
    PARENT: { students: { some: { parentId: userId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(classId && { classId }),

      ...(role !== "ADMIN" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {data.map((item, index) => (
          <div
            key={item.id}
            className={
              index === 0
                ? "bg-aSkyLight rounded-md p-4"
                : index === 1
                ? "bg-aPurpleLight rounded-md p-4"
                : "bg-aYellowLight rounded-md p-4"
            }
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{item.title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(item.date)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
