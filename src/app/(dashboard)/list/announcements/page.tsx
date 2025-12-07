import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import AnnouncementFilterDropdown from "@/components/AnnouncementFilterDropdown";
import AnnouncementSortDropdown from "@/components/AnnouncementSortDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

export type AnnouncementRow = {
  id: number;
  title: string;
  description: string;
  className: string | null;
  date: Date;
};

const AnnouncementListPage = async ({ searchParams }: any) => {
  const params = await searchParams;

  const user = await getUserFromJWT();
  const role = String(user?.role || "GUEST").toUpperCase();

  const page = params.page ? Number(params.page) : 1;
  const search = params.search || "";
  const classId = params.classId || "";
  const date = params.date || "";
  const sort = params.sort || "";

  const query: Prisma.AnnouncementWhereInput = {};

  if (search) {
    query.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { class: { name: { contains: search } } },
    ];
  }

  if (classId) query.classId = Number(classId);

  if (date) {
    query.date = {
      gte: new Date(date + "T00:00:00"),
      lte: new Date(date + "T23:59:59"),
    };
  }

  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { id: user?.userId },
      select: { classId: true },
    });
    if (student) query.classId = student.classId;
  }

  if (role === "TEACHER") {
    query.class = { lessons: { some: { teacherId: user?.userId } } };
  }

  if (role === "PARENT") {
    query.class = { students: { some: { parentId: user?.userId } } };
  }

  let orderBy: any = { id: "desc" };
  if (sort === "title_asc") orderBy = { title: "asc" };
  if (sort === "title_desc") orderBy = { title: "desc" };
  if (sort === "newest") orderBy = { date: "desc" };
  if (sort === "oldest") orderBy = { date: "asc" };

  const classes = await prisma.class.findMany();

  const [raw, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
      orderBy,
    }),
    prisma.announcement.count({ where: query }),
  ]);

  const data: AnnouncementRow[] = raw.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    className: item.class?.name || "-",
    date: item.date,
  }));

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Description", accessor: "description" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "ADMIN" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: AnnouncementRow) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td>{item.title}</td>
      <td className="max-w-xs truncate">{item.description}</td>
      <td className="flex items-center gap-4 p-4">{item.className}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.date)}
      </td>

      {role === "ADMIN" && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="announcement" type="update" data={raw.find((a) => a.id === item.id)} />
            <FormContainer table="announcement" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Announcements</h1>

        <div className="flex items-center gap-4">
          <TableSearch />
          <AnnouncementFilterDropdown classes={classes} />
          <AnnouncementSortDropdown />
          {role === "ADMIN" && (
            <FormContainer table="announcement" type="create" />
          )}
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={page} count={count} />
    </div>
  );
};

export default AnnouncementListPage;
