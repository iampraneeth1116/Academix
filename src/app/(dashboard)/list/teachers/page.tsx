import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import TableFilterDropdown from "@/components/TableFilterDropdown";
import TableSortDropdown from "@/components/TableSortDropdown";

type TeacherList = Teacher & {
  teacherSubjects: { subject: Subject }[];
  classes: Class[];
};

const TeacherListPage = async ({ searchParams }: any) => {
  const params = await searchParams;

  // ==========================================
  // LOAD SUBJECTS + CLASSES (Dropdown Source)
  // ==========================================
  const subjects = await prisma.subject.findMany();
  const classes = await prisma.class.findMany();

  // ==========================================
  // JWT ROLE
  // ==========================================
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "GUEST" = "GUEST";
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      role = decoded.role || "GUEST";
    } catch {
      role = "GUEST";
    }
  }

  // ==========================================
  // TABLE COLUMNS
  // ==========================================
  const columns = [
    { header: "Info", accessor: "info" },
    { header: "Teacher ID", accessor: "teacherId", className: "hidden md:table-cell" },
    { header: "Subjects", accessor: "subjects", className: "hidden md:table-cell" },
    { header: "Classes", accessor: "classes", className: "hidden md:table-cell" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
    ...(role === "ADMIN" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // ==========================================
  // ROW RENDER FUNCTION
  // ==========================================
  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-aPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt="avatar"
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />

        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      </td>

      <td className="hidden md:table-cell">{item.username}</td>

      <td className="hidden md:table-cell">
        {item.teacherSubjects.map((ts) => ts.subject.name).join(", ")}
      </td>

      <td className="hidden md:table-cell">
        {item.classes.map((cls) => cls.name).join(", ")}
      </td>

      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>

      {role === "ADMIN" && (
        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/teachers/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-aSky">
                <Image src="/view.png" alt="view" width={16} height={16} />
              </button>
            </Link>

            <FormContainer table="teacher" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // ==========================================
  // PAGINATION + URL PARAMS
  // ==========================================
  const { search, classId, subjectId, sort } = params;
  const page = params.page ? Number(params.page) : 1;

  // ==========================================
  // OPTIONAL FILTERS (ONLY APPLY IF PARAMS EXIST)
  // ==========================================
  const query: Prisma.TeacherWhereInput = {};

  // 🔍 SEARCH ONLY BY TEACHER NAME
  if (search) {
    query.name = { contains: search};
  }

  if (classId) {
    query.classes = { some: { id: Number(classId) } };
  }

  if (subjectId) {
    query.teacherSubjects = { some: { subjectId: Number(subjectId) } };
  }

  // ==========================================
  // OPTIONAL SORTING
  // ==========================================
  let orderBy: any = undefined;

  switch (sort) {
    case "name_asc":
      orderBy = { name: "asc" };
      break;
    case "name_desc":
      orderBy = { name: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
  }

  // ==========================================
  // FETCH TEACHERS
  // ==========================================
  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      orderBy,
      include: {
        teacherSubjects: { include: { subject: true } },
        classes: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),

    prisma.teacher.count({ where: query }),
  ]);

  // ==========================================
  // PAGE UI
  // ==========================================
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">

      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>

        <div className="flex items-center gap-4">
          <TableSearch />

          {/* Filter Dropdown */}
          <TableFilterDropdown subjects={subjects} classes={classes} />

          {/* Sort Dropdown */}
          <TableSortDropdown />

          {role === "ADMIN" && (
            <FormContainer table="teacher" type="create" />
          )}
        </div>
      </div>

      {/* TABLE OR NO DATA */}
      {data.length === 0 ? (
        <div className="w-full py-10 text-center text-gray-500 font-medium">
          No Data Found
        </div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={data} />
      )}

      {/* PAGINATION */}
      <Pagination page={page} count={count} />
    </div>
  );
};

export default TeacherListPage;
