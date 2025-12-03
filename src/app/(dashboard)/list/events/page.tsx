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

// Row type
type EventList = Event & { class: Class | null };

// ---------------- JWT AUTH ---------------- //
async function getUserFromJWT() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

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
// ------------------------------------------- //

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  const user = await getUserFromJWT();
  const role = user?.role;
  const currentUserId = user?.userId;

  // TABLE COLUMNS
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    { header: "Start Time", accessor: "startTime", className: "hidden md:table-cell" },
    { header: "End Time", accessor: "endTime", className: "hidden md:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // TABLE ROW
  const renderRow = (item: EventList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.class?.name ?? "-"}</td>

      {/* DATE */}
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>

      {/* START */}
      <td className="hidden md:table-cell">
        {item.startTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>

      {/* END */}
      <td className="hidden md:table-cell">
        {item.endTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
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
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // ============================================
  //  FILTERS
  // ============================================
  const query: Prisma.EventWhereInput = {};

  if (queryParams.search) {
    query.title = {
      contains: queryParams.search,
      mode: "insensitive",
    } as any;
  }

  // ============================================
  //  ROLE-BASED EVENT ACCESS
  // ============================================

  if (role === "teacher") {
    // Teacher → See events of classes they teach
    const teacherClasses = await prisma.class.findMany({
      where: { supervisorId: currentUserId },
      select: { id: true },
    });

    query.classId = { in: teacherClasses.map((c) => c.id) };
  }

  if (role === "student") {
    // Student → See events of their class
    const student = await prisma.student.findUnique({
      where: { id: currentUserId! },
      select: { classId: true },
    });

    query.classId = student?.classId ?? undefined;
  }

  if (role === "parent") {
    // Parent → See events of their child's class
    const child = await prisma.student.findFirst({
      where: { parentId: currentUserId! },
      select: { classId: true },
    });

    query.classId = child?.classId ?? undefined;
  }

  // Admin → no filter

  // ============================================
  //  FETCH DATA
  // ============================================
  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { startTime: "asc" },
    }),

    prisma.event.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">

      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>

            {role === "admin" && <FormContainer table="event" type="create" />}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default EventListPage;
