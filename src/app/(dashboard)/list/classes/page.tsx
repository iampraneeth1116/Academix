import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilterDropdown from "@/components/ClassFilterDropdown";
import TableSortDropdown from "@/components/TableSortDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher, Grade } from "@prisma/client";
import Image from "next/image";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type ClassList = Class & { supervisor: Teacher | null; grade: Grade };

async function getUserFromJWT() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
  } catch {
    return null;
  }
}

const ClassListPage = async ({ searchParams }: any) => {
  const params = await searchParams;

  const user = await getUserFromJWT();
  const role = user?.role?.toUpperCase() || "GUEST";

  const supervisors = await prisma.teacher.findMany();
  const grades = await prisma.grade.findMany();

  const columns = [
    { header: "Class Name", accessor: "name" },
    { header: "Capacity", accessor: "capacity", className: "hidden md:table-cell" },
    { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
    { header: "Supervisor", accessor: "supervisor", className: "hidden md:table-cell" },
    ...(role === "ADMIN" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ClassList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm">
      <td className="p-4">{item.name}</td>

      <td className="hidden md:table-cell">{item.capacity}</td>

      <td className="hidden md:table-cell">{item.grade.level}</td>

      <td className="hidden md:table-cell">
        {item.supervisor ? `${item.supervisor.name} ${item.supervisor.surname}` : "-"}
      </td>

      {role === "ADMIN" && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const search = params.search;
  const gradeId = params.gradeId;
  const supervisorId = params.supervisorId;
  const sort = params.sort;
  const page = params.page ? Number(params.page) : 1;

  const query: Prisma.ClassWhereInput = {};

  if (search) {
    query.name = { contains: search };
  }

  if (gradeId) query.gradeId = Number(gradeId);

  if (supervisorId) query.supervisorId = supervisorId;

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
    prisma.class.findMany({
      where: query,
      orderBy,
      include: { supervisor: true, grade: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),

    prisma.class.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>

        <div className="flex items-center gap-4">
          <TableSearch />
          <TableFilterDropdown supervisors={supervisors} grades={grades} />
          <TableSortDropdown />

          {role === "ADMIN" && (
            <FormContainer table="class" type="create" />
          )}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="w-full py-10 text-center text-gray-500">No Data Found</div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={data} />
      )}

      <Pagination page={page} count={count} />
    </div>
  );
};

export default ClassListPage;
