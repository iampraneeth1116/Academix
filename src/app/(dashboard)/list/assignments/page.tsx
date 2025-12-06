import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Assignment row type
type AssignmentList = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

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
// ------------------------------------------- //

const AssignmentListPage = async ({ searchParams }: any) => {
  const user = await getUserFromJWT();
  const role = user?.role?.toUpperCase() ?? "GUEST";
  const currentUserId = user?.userId ?? null;

  // ---------------- TABLE COLUMNS ---------------- //
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Due Date", accessor: "dueDate", className: "hidden md:table-cell" },
    ...(role === "ADMIN" || role === "TEACHER"
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  // ---------------- RENDER ROW ---------------- //
  const renderRow = (item: AssignmentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td>{item.title}</td>

      <td className="flex items-center gap-4 p-4">
        {item.lesson.subject.name}
      </td>

      <td>{item.lesson.class.name}</td>

      <td className="hidden md:table-cell">
        {item.lesson.teacher.name} {item.lesson.teacher.surname}
      </td>

      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.dueDate)}
      </td>

      <td>
        {(role === "ADMIN" || role === "TEACHER") && (
          <div className="flex items-center gap-2">
            <FormContainer table="assignment" type="update" data={item} currentUserId={currentUserId} />
            <FormContainer table="assignment" type="delete" id={item.id.toString()} currentUserId={currentUserId} />
          </div>
        )}
      </td>
    </tr>
  );

  // ---------------- PAGINATION ---------------- //
  const { page, ...filters } = searchParams;
  const p = page ? parseInt(page) : 1;

  // ---------------- FILTERS ---------------- //
// ---------------- FILTERS ---------------- //
const query: Prisma.AssignmentWhereInput = {
  lesson: {} as Prisma.LessonWhereInput,
};

for (const [key, value] of Object.entries(filters)) {
  if (!value) continue;

  switch (key) {
    case "classId":
      query.lesson!.classId = parseInt(value as string);
      break;

    case "teacherId":
      query.lesson!.teacherId = value as string;
      break;

    case "search":
      query.lesson!.subject = {
        name: {
          contains: value as string,   // <-- FIXED
          mode: "insensitive",
        },
      } as Prisma.SubjectWhereInput;
      break;
  }
}



  // ---------------- ROLE RESTRICTIONS ---------------- //
  if (role === "TEACHER") {
    query.lesson!.teacherId = currentUserId!;
  }

  if (role === "STUDENT") {
    query.lesson!.class = {
      students: { some: { id: currentUserId! } },
    };
  }

  if (role === "PARENT") {
    query.lesson!.class = {
      students: { some: { parentId: currentUserId! } },
    };
  }

  // ---------------- DB QUERY ---------------- //
  const [data, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        lesson: { include: { subject: true, teacher: true, class: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.assignment.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Assignments</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="filter" width={14} height={14} />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="sort" width={14} height={14} />
            </button>

            {(role === "ADMIN" || role === "TEACHER") && (
              <FormContainer table="assignment" type="create" currentUserId={currentUserId} />
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

export default AssignmentListPage;
