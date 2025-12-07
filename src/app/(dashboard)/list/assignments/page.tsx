import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import AssignmentFilterDropdown from "@/components/AssignmentFilterDropdown";
import AssignmentSortDropdown from "@/components/AssignmentSortDropdown";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// ---------------- TYPES ---------------- //
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

export default async function AssignmentListPage({ searchParams }: any) {
  const params = await searchParams;

  const user = await getUserFromJWT();
  const role = (user?.role || "GUEST").toUpperCase();
  const currentUserId = user?.userId || null;

  const subjects = await prisma.subject.findMany();
  const classes = await prisma.class.findMany();
  const teachers = await prisma.teacher.findMany();

  // ---------------- COLUMNS ---------------- //
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

  // ---------------- ROW ---------------- //
  const renderRow = (item: AssignmentList) => (
    <tr key={item.id} className="border-b border-gray-200 text-sm hover:bg-aPurpleLight">
      <td className="p-4">{item.title}</td>
      <td>{item.lesson.subject.name}</td>
      <td>{item.lesson.class.name}</td>
      <td className="hidden md:table-cell">
        {item.lesson.teacher.name} {item.lesson.teacher.surname}
      </td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.dueDate)}
      </td>

      {(role === "ADMIN" || role === "TEACHER") && (
        <td>
          <div className="flex gap-2">
            <FormContainer table="assignment" type="update" data={item} currentUserId={currentUserId} />
            <FormContainer table="assignment" type="delete" id={item.id.toString()} currentUserId={currentUserId} />
          </div>
        </td>
      )}
    </tr>
  );

  // ---------------- PARAMS ---------------- //
  const search = params.search;
  const subjectId = params.subjectId;
  const classId = params.classId;
  const teacherId = params.teacherId;
  const sort = params.sort;

  const page = params.page ? Number(params.page) : 1;

  // ---------------- QUERY ---------------- //
  const query: Prisma.AssignmentWhereInput = {
    lesson: {},
  };

  if (search) {
    query.OR = [
      { title: { contains: search } },
      { lesson: { subject: { name: { contains: search } } } },
      { lesson: { class: { name: { contains: search } } } },
      { lesson: { teacher: { name: { contains: search } } } },
    ];
  }

  if (subjectId) query.lesson!.subjectId = Number(subjectId);
  if (classId) query.lesson!.classId = Number(classId);
  if (teacherId) query.lesson!.teacherId = teacherId;

  // ROLE restrictions
  if (role === "TEACHER") query.lesson!.teacherId = currentUserId!;
  if (role === "STUDENT") {
    query.lesson!.class = { students: { some: { id: currentUserId! } } };
  }
  if (role === "PARENT") {
    query.lesson!.class = { students: { some: { parentId: currentUserId! } } };
  }

  // ---------------- SORT ---------------- //
  let orderBy: any = undefined;

  switch (sort) {
    case "title_asc":
      orderBy = { title: "asc" };
      break;

    case "title_desc":
      orderBy = { title: "desc" };
      break;

    case "newest":
      orderBy = { dueDate: "desc" };
      break;

    case "oldest":
      orderBy = { dueDate: "asc" };
      break;
  }

  // ---------------- DB ---------------- //
  const [data, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      orderBy,
      include: {
        lesson: { include: { subject: true, class: true, teacher: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.assignment.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md m-4 mt-0">
      <div className="flex justify-between items-center">

        <h1 className="hidden md:block text-lg font-semibold">All Assignments</h1>

        <div className="flex items-center gap-4">
          <TableSearch />
          <AssignmentFilterDropdown subjects={subjects} classes={classes} teachers={teachers} />
          <AssignmentSortDropdown />

          {(role === "ADMIN" || role === "TEACHER") && (
            <FormContainer table="assignment" type="create" currentUserId={currentUserId} />
          )}
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
