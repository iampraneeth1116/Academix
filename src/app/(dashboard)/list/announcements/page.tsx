import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

export type AnnouncementRow = {
  id: number;
  title: string;
  description: string;
  className: string | null;
  date: Date;
};

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // ---------------- AUTH ---------------- //
  const user = await getUserFromJWT();
  const role = String(user?.role || "GUEST").toUpperCase();

  // ---------------- PAGE ---------------- //
  const page = searchParams.page ? Number(searchParams.page) : 1;

  // ---------------- FILTERS ---------------- //
  const query: Prisma.AnnouncementWhereInput = {};

  if (searchParams.search) {
    const s = searchParams.search;
    query.OR = [
      { title: { contains: s } },
      { description: { contains: s } },
      { class: { name: { contains: s } } },
    ];
  }

  // STUDENT VIEW → only their class
  if (role === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: { id: user?.userId },
      select: { classId: true },
    });

    if (student) query.classId = student.classId;
  }

  // TEACHER VIEW → only classes they teach
  if (role === "TEACHER") {
    query.class = {
      lessons: {
        some: { teacherId: user?.userId },
      },
    };
  }

  // PARENT VIEW → only their children's class
  if (role === "PARENT") {
    query.class = {
      students: {
        some: { parentId: user?.userId },
      },
    };
  }

  // ---------------- DB QUERY ---------------- //
  const [rawAnnouncements, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
      orderBy: { id: "desc" },
    }),
    prisma.announcement.count({ where: query }),
  ]);

  const data: AnnouncementRow[] = rawAnnouncements.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    className: item.class?.name || "-",
    date: item.date,
  }));

  // ---------------- TABLE COLUMNS ---------------- //
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Description", accessor: "description" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "ADMIN" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // ---------------- RENDER ROW ---------------- //
  const renderRow = (item: AnnouncementRow) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td>{item.title}</td>

      <td className="max-w-xs truncate">{item.description}</td>

      <td className="flex items-center gap-4 p-4">{item.className}</td>

      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.date)}
      </td>

      <td>
        {role === "ADMIN" && (
          <div className="flex items-center gap-2">
            <FormContainer
              table="announcement"
              type="update"
              data={rawAnnouncements.find((a) => a.id === item.id)}
            />

            <FormContainer
              table="announcement"
              type="delete"
              id={item.id}
            />
          </div>
        )}
      </td>
    </tr>
  );

  // ---------------- UI ---------------- //
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">

      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Announcements
        </h1>

      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        <TableSearch />

        <div className="flex items-center gap-4 self-end">

          {role === "ADMIN" && (
            <FormContainer table="announcement" type="create" />
          )}
        </div>
      </div>
    </div>

      {/* TABLE */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={page} count={count} />
    </div>
  );
};

export default AnnouncementListPage;
