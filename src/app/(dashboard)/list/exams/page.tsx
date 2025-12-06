// app/(dashboard)/list/exams/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";

type ExamList = Exam & {
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

const ExamListPage = async ({
  searchParams,
}: {
  // Next.js passes searchParams as a Promise in some versions
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  // Unwrap searchParams (fix for Next.js 13/14/15+)
  const params = await searchParams;

  // GET USER FROM JWT
  const user = await getUserFromJWT();
  const roleRaw = user?.role ?? "GUEST";
  const role = String(roleRaw).toUpperCase();
  const currentUserId = user?.userId ?? null;

  // TABLE COLUMNS
  const columns = [
    {header: "Title", accessor: "title"},
    { header: "Subject", accessor: "name" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "ADMIN" || role === "TEACHER"
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  // RENDER ROW
const renderRow = (item: ExamList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td>{item.title}</td> {/* NEW COLUMN */}
    
    <td className="flex items-center gap-4 p-4">{item.lesson.subject.name}</td>
    <td>{item.lesson.class.name}</td>
    <td className="hidden md:table-cell">
      {item.lesson.teacher.name} {item.lesson.teacher.surname}
    </td>
    <td className="hidden md:table-cell">
      {new Intl.DateTimeFormat("en-US").format(item.startTime)}
    </td>

    <td>
      {(role === "ADMIN" || role === "TEACHER") && (
        <div className="flex items-center gap-2">
          <FormContainer table="exam" type="update" data={item} currentUserId={currentUserId} />
          <FormContainer table="exam" type="delete" id={item.id.toString()} currentUserId={currentUserId} />
        </div>
      )}
    </td>
  </tr>
);


  // PAGINATION
  const { page, ...queryParams } = params;
  const p = page ? parseInt(page) : 1;

  // BUILD QUERY
  const query: Prisma.ExamWhereInput = {
    lesson: {},
  };

for (const [key, value] of Object.entries(queryParams)) {
  if (!value) continue;

  switch (key) {
    case "classId":
      query.lesson!.classId = parseInt(value);
      break;

    case "teacherId":
      query.lesson!.teacherId = value;
      break;

    case "search":
      query.AND = [
        {
          lesson: {
            subject: {
              name: {
                contains: value,
                
              },
            },
          },
        },
      ];
      break;
  }
}



  // ROLE RESTRICTIONS
  switch (role) {
    case "ADMIN":
      break;
    case "TEACHER":
      query.lesson!.teacherId = currentUserId!;
      break;
    case "STUDENT":
      query.lesson!.class = { students: { some: { id: currentUserId! } } };
      break;
    case "PARENT":
      query.lesson!.class = { students: { some: { parentId: currentUserId! } } };
      break;
    default:
      break;
  }

  // FETCH DATA
  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { id: true, name: true } },
            teacher: { select: { id: true, name: true, surname: true } },
            class: { select: { id: true, name: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>

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
              <FormContainer table="exam" type="create" currentUserId={currentUserId} />
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

export default ExamListPage;
