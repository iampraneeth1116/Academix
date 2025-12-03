import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Class, Prisma } from "@prisma/client";
import Image from "next/image";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

type AnnouncementList = Announcement & { class: Class };

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams; // FIX: unwrap promise

  const user = await getUserFromJWT();
  const role = user?.role;
  const currentUserId = user?.userId;

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: AnnouncementList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>

      <td>{item.class?.name || "-"}</td>

      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.date)}
      </td>

      <td>
        {role === "admin" && (
          <div className="flex items-center gap-2">
            <FormContainer table="announcement" type="update" data={item} />
            <FormContainer table="announcement" type="delete" id={item.id} />
          </div>
        )}
      </td>
    </tr>
  );

  // PAGINATION
  const page = params.page ? parseInt(params.page) : 1;

  // FILTERS
  const query: Prisma.AnnouncementWhereInput = {};

  if (params.search) {
    query.title = {
      contains: params.search,
      mode: "insensitive",
    } as any;
  }

  const roleConditions: Record<string, any> = {
    teacher: { lessons: { some: { teacherId: currentUserId } } },
    student: { students: { some: { id: currentUserId } } },
    parent: { students: { some: { parentId: currentUserId } } },
  };

  if (role !== "admin") {
    const cond =
      role && ["teacher", "student", "parent"].includes(role)
        ? roleConditions[role]
        : {};

    query.OR = [{ classId: null }, { class: cond }];
  }

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

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
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>

            {role === "admin" && (
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
