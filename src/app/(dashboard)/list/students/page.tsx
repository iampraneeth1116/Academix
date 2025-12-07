import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import StudentFilterDropdown from "@/components/StudentFilterDropdown";
import TableSortDropdown from "@/components/TableSortDropdown";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Grade, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type StudentList = Student & { class: Class; grade: Grade };

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const classes = await prisma.class.findMany();
  const grades = await prisma.grade.findMany();

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

  const columns = [
    { header: "Info", accessor: "info" },
    { header: "Student ID", accessor: "studentId", className: "hidden md:table-cell" },
    { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
    ...(role === "ADMIN" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-aPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt="student"
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>

      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.grade.level}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>

      {role === "ADMIN" && (
        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/students/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-aSky">
                <Image src="/view.png" alt="view" width={16} height={16} />
              </button>
            </Link>

            <FormContainer table="student" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, search, classId, gradeId, sort } = await searchParams;
  const p = page ? Number(page) : 1;

  const query: Prisma.StudentWhereInput = {};

  if (search) {
    query.name = { contains: search };
  }

  if (classId) {
    query.classId = Number(classId);
  }

  if (gradeId) {
    query.gradeId = Number(gradeId);
  }

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

  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      orderBy,
      include: {
        class: true,
        grade: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>

        <div className="flex items-center gap-4">
          <TableSearch />
          <StudentFilterDropdown classes={classes} grades={grades} />
          <TableSortDropdown />
          {role === "ADMIN" && <FormContainer table="student" type="create" />}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="w-full py-10 text-center text-gray-500 font-medium">
          No Data Found
        </div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={data} />
      )}

      <Pagination page={p} count={count} />
    </div>
  );
};

export default StudentListPage;
