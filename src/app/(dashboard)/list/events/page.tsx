import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type EventList = Event & { class: Class | null };

// ---------------- JWT AUTH ---------------- //
async function getUserFromJWT() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
    };
  } catch {
    return null;
  }
}

const EventListPage = async ({ searchParams }: any) => {

  const user = await getUserFromJWT();
  const role = String(user?.role || "GUEST").toLowerCase();
  const currentUserId = user?.userId;

  // ---------------- COLUMNS ---------------- //
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    { header: "Start", accessor: "startTime", className: "hidden md:table-cell" },
    { header: "End", accessor: "endTime", className: "hidden md:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // ---------------- ROW UI ---------------- //
  const renderRow = (item: EventList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.class?.name || "-"}</td>

      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>

      <td className="hidden md:table-cell">
        {item.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
      </td>

      <td className="hidden md:table-cell">
        {item.endTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
      </td>

      <td>
        {role === "admin" && (
          <div className="flex items-center gap-2">
            <FormContainer table="event" type="update" data={item} />
            <FormContainer table="event" type="delete" id={item.id} />
          </div>
        )}
      </td>
    </tr>
  );

  // Pagination
  const { page, search } = searchParams;
  const p = page ? Number(page) : 1;

  // ---------------- FILTER ---------------- //
  const query: Prisma.EventWhereInput = {};
  if (search) query.title = { contains: search };

  // TEACHER → events for classes they teach
  if (role === "teacher") {
    const teachClasses = await prisma.class.findMany({
      where: { supervisorId: currentUserId },
      select: { id: true },
    });
    query.classId = { in: teachClasses.map((c) => c.id) };
  }

  // STUDENT → only their class
  if (role === "student") {
    const student = await prisma.student.findUnique({
      where: { id: currentUserId! },
      select: { classId: true },
    });
    query.classId = student?.classId ?? undefined;
  }

  // PARENT → child's class
  if (role === "parent") {
    const child = await prisma.student.findFirst({
      where: { parentId: currentUserId! },
      select: { classId: true },
    });
    query.classId = child?.classId ?? undefined;
  }

  // ---------------- FETCH ---------------- //
  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { startTime: "desc" },
    }),
    prisma.event.count({ where: query }),
  ]);

  // ---------------- UI ---------------- //
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">

      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            {role === "admin" && (
              <FormContainer table="event" type="create" />
            )}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />

      <Pagination page={p} count={count} />
    </div>
  );
};

export default EventListPage;
