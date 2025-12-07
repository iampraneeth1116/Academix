import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import ResultFilterDropdown from "@/components/ResultFilterDropdown";
import ResultSortDropdown from "@/components/ResultSortDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type ResultList = {
  id: number;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  date: Date;
};

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

export default async function ResultListPage({ searchParams }: any) {
  const params = await searchParams;

  const user = await getUserFromJWT();
  const role = String(user?.role || "GUEST").toUpperCase();
  const currentUserId = user?.userId || null;

  const students = await prisma.student.findMany();
  const teachers = await prisma.teacher.findMany();
  const classes = await prisma.class.findMany();

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Student", accessor: "student" },
    { header: "Score", accessor: "score", className: "hidden md:table-cell" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "ADMIN" || role === "TEACHER" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-aPurpleLight">
      <td>{item.title}</td>
      <td className="flex items-center gap-4 p-4">{item.studentName} {item.studentSurname}</td>
      <td className="hidden md:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">{item.teacherName} {item.teacherSurname}</td>
      <td className="hidden md:table-cell">{item.className}</td>
      <td className="hidden md:table-cell">{new Intl.DateTimeFormat("en-US").format(item.date)}</td>

      {(role === "ADMIN" || role === "TEACHER") && (
        <td>
          <div className="flex gap-2">
            <FormContainer table="result" type="update" data={item} currentUserId={currentUserId} />
            <FormContainer table="result" type="delete" id={item.id} currentUserId={currentUserId} />
          </div>
        </td>
      )}
    </tr>
  );

  const search = params.search;
  const studentId = params.studentId;
  const classId = params.classId;
  const teacherId = params.teacherId;
  const sort = params.sort;
  const page = params.page ? Number(params.page) : 1;

  const query: any = {};

  if (search) {
    query.OR = [
      { exam: { title: { contains: search } } },
      { assignment: { title: { contains: search } } },
      { student: { name: { contains: search } } },
      { student: { surname: { contains: search } } },
      { exam: { lesson: { class: { name: { contains: search } } } } },
      { assignment: { lesson: { class: { name: { contains: search } } } } },
    ];
  }

  if (studentId) query.studentId = studentId;

  if (classId) {
    query.OR = [
      { exam: { lesson: { classId: Number(classId) } } },
      { assignment: { lesson: { classId: Number(classId) } } },
    ];
  }

  if (teacherId) {
    query.OR = [
      { exam: { lesson: { teacherId } } },
      { assignment: { lesson: { teacherId } } },
    ];
  }

  if (role === "TEACHER") {
    query.OR = [
      { exam: { lesson: { teacherId: currentUserId } } },
      { assignment: { lesson: { teacherId: currentUserId } } },
    ];
  }

  if (role === "STUDENT") query.studentId = currentUserId;
  if (role === "PARENT") query.student = { parentId: currentUserId };

  let orderBy: any = undefined;

  switch (sort) {
    case "title_asc":
      orderBy = { score: "asc" };
      break;
    case "title_desc":
      orderBy = { score: "desc" };
      break;
    case "newest":
      orderBy = { id: "desc" };
      break;
    case "oldest":
      orderBy = { id: "asc" };
      break;
  }

  const [raw, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      orderBy,
      include: {
        student: true,
        exam: { include: { lesson: { include: { teacher: true, class: true } } } },
        assignment: { include: { lesson: { include: { teacher: true, class: true } } } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),

    prisma.result.count({ where: query }),
  ]);

  const data: ResultList[] = raw
    .map((item) => {
      const exam = item.exam;
      const assignment = item.assignment;

      const assessment = exam || assignment;
      if (!assessment) return null;

      const lesson = assessment.lesson;
      if (!lesson) return null;

      return {
        id: item.id,
        title: assessment.title,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        teacherName: lesson.teacher.name,
        teacherSurname: lesson.teacher.surname,
        score: item.score,
        className: lesson.class.name,
        date: exam ? exam.startTime : assignment!.startDate,
      };
    })
    .filter(Boolean) as ResultList[];

  return (
    <div className="bg-white p-4 rounded-md m-4 mt-0">
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          <ResultFilterDropdown students={students} classes={classes} teachers={teachers} />
          <ResultSortDropdown />
          {(role === "ADMIN" || role === "TEACHER") && (
            <FormContainer table="result" type="create" currentUserId={currentUserId} />
          )}
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={page} count={count} />
    </div>
  );
}
