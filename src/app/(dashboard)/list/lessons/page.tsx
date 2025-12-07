import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import LessonFilterDropdown from "@/components/LessonFilterDropdown";
import LessonSortDropdown from "@/components/LessonSortDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type LessonList = Lesson & {
  subject: Subject;
  class: Class;
  teacher: Teacher;
};

async function getUserFromJWT() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export default async function LessonListPage({ searchParams }: any) {
  const params = typeof searchParams?.then === "function" ? await searchParams : searchParams || {};

  const user = await getUserFromJWT();
  const role = (user?.role || "").toUpperCase();
  const currentUserId = user?.userId;

  const subjects = await prisma.subject.findMany();
  const classes = await prisma.class.findMany();
  const teachers = await prisma.teacher.findMany();

  // ---------------- COLUMNS (Added Lesson Name) ---------------- //
  const columns = [
    { header: "Lesson Name", accessor: "name" },
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    ...(role === "ADMIN" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // ---------------- ROW UI ---------------- //
  const renderRow = (item: LessonList) => (
    <tr key={item.id} className="border-b border-gray-200 text-sm hover:bg-aPurpleLight">
      <td className="p-4">{item.name}</td> {/* LESSON NAME */}
      <td>{item.subject.name}</td>
      <td>{item.class.name}</td>
      <td className="hidden md:table-cell">
        {item.teacher.name} {item.teacher.surname}
      </td>

      {role === "ADMIN" && (
        <td>
          <div className="flex gap-2">
            <FormContainer table="lesson" type="update" data={item} />
            <FormContainer table="lesson" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // ---------------- FILTERS ---------------- //
  const search = params.search?.toString()?.trim() || "";
  const subjectId = params.subjectId;
  const classId = params.classId;
  const teacherId = params.teacherId;
  const sort = params.sort;
  const page = params.page ? Number(params.page) : 1;

  const query: Prisma.LessonWhereInput = {};

  if (search) {
    query.OR = [
      { name: { contains: search } }, // search lesson name also
      { subject: { name: { contains: search } } },
      { class: { name: { contains: search } } },
      { teacher: { name: { contains: search } } },
    ];
  }

  if (subjectId) query.subjectId = Number(subjectId);
  if (classId) query.classId = Number(classId);
  if (teacherId) query.teacherId = teacherId;

  if (role === "TEACHER" && currentUserId) {
    query.teacherId = currentUserId;
  }

  // ---------------- SORT FIX ---------------- //
  let orderBy: any = undefined;

  switch (sort) {
    case "subject_asc":
      orderBy = { subject: { name: "asc" } };
      break;

    case "subject_desc":
      orderBy = { subject: { name: "desc" } };
      break;

    case "newest":
      orderBy = { id: "desc" }; // FIXED
      break;

    case "oldest":
      orderBy = { id: "asc" }; // FIXED
      break;
  }

  // ---------------- FETCH DATA ---------------- //
  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: { subject: true, class: true, teacher: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.lesson.count({ where: query }),
  ]);

  // ---------------- UI ---------------- //
  return (
    <div className="bg-white p-4 rounded-md m-4 mt-0">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold hidden md:block">All Lessons</h1>

        <div className="flex items-center gap-4">
          <TableSearch />

          <LessonFilterDropdown subjects={subjects} classes={classes} teachers={teachers} />

          <LessonSortDropdown />

          {role === "ADMIN" && <FormContainer table="lesson" type="create" />}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No Data Found</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={data} />
      )}

      <Pagination page={page} count={count} />
    </div>
  );
}
