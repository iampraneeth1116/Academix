import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type ClassList = Class & { supervisor: Teacher | null };

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

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  const user = await getUserFromJWT();
  const role = user?.role;

  // ------------ TABLE COLUMNS ------------ //
  const columns = [
    { header: "Class Name", accessor: "name" },
    { header: "Capacity", accessor: "capacity", className: "hidden md:table-cell" },
    { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
    { header: "Supervisor", accessor: "supervisor", className: "hidden md:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // ------------ TABLE ROW ------------ //
  const renderRow = (item: ClassList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>

      <td className="hidden md:table-cell">{item.capacity}</td>

      {/* FIXED GRADE DISPLAY */}
      <td className="hidden md:table-cell">{item.gradeId}</td>

      {/* SUPERVISOR */}
      <td className="hidden md:table-cell">
        {item.supervisor
          ? `${item.supervisor.name} ${item.supervisor.surname}`
          : "-"}
      </td>

      <td>
        {role === "admin" && (
          <div className="flex items-center gap-2">
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </div>
        )}
      </td>
    </tr>
  );

  // ------------ PAGINATION ------------ //
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // ------------ FILTERS ------------ //
  const query: Prisma.ClassWhereInput = {};

  if (queryParams.supervisorId) {
    query.supervisorId = queryParams.supervisorId;
  }

  if (queryParams.search) {
    query.name = {
      contains: queryParams.search,
      mode: "insensitive",
    } as any;
  }

  // ------------ DB QUERY ------------ //
  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
        grade: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),

    prisma.class.count({ where: query }),
  ]);

  // ------------ UI RENDER ------------ //
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">

      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>

            {role === "admin" && <FormContainer table="class" type="create" />}
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

export default ClassListPage;
