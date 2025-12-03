import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Type for lesson row
type LessonList = Lesson & {
  subject: Subject;
  class: Class;
  teacher: Teacher;
};

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

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  
  const user = await getUserFromJWT();
  const role = user?.role;
  const currentUserId = user?.userId;

  // TABLE COLUMNS
  const columns = [
    { header: "Subject Name", accessor: "name" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // ROW RENDERER
  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
      <td>{item.class.name}</td>
      <td className="hidden md:table-cell">
        {item.teacher.name + " " + item.teacher.surname}
      </td>

      <td>
        {role === "admin" && (
          <div className="flex items-center gap-2">
            <FormContainer table="lesson" type="update" data={item} />
            <FormContainer table="lesson" type="delete" id={item.id} />
          </div>
        )}
      </td>
    </tr>
  );

  // PAGINATION
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // FILTERS
  const query: Prisma.LessonWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "classId":
        query.classId = parseInt(value);
        break;

      case "teacherId":
        query.teacherId = value;
        break;

      case "search":
        query.OR = [
          {
            subject: {
              name: {
                contains: value,
                mode: "insensitive",
              } as any,  // FIXED
            },
          },
          {
            teacher: {
              name: {
                contains: value,
                mode: "insensitive",
              } as any,  // FIXED
            },
          },
        ];
        break;
    }
  }

  // RESTRICT TEACHER TO OWN LESSONS
  if (role === "teacher") {
    query.teacherId = currentUserId!;
  }

  // FETCH DATA
  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">

      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>

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
              <FormContainer table="lesson" type="create" />
            )}
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

export default LessonListPage;
