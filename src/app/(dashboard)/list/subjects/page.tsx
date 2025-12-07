import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Subject type with teachers extracted manually
type SubjectList = Subject & { teachers: Teacher[] };

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

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  const user = await getUserFromJWT();
  const role = user?.role;

  const columns = [
    { header: "Subject Name", accessor: "name" },
    {
      header: "Teachers",
      accessor: "teachers",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: SubjectList) => (
    <tr key={item.id} 
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>

      <td className="hidden md:table-cell">
        {item.teachers.map((t) => `${t.name} ${t.surname}`).join(", ")}
      </td>

      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="subject" type="update" data={item} />
            <FormContainer table="subject" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // Pagination
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Search Filter
  const query: Prisma.SubjectWhereInput = {};

  if (queryParams.search) {
    query.name = { contains: queryParams.search }; // FIX: remove mode
  }

  // DB Query
  const [rawData, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: {
        teacherSubjects: {
          include: { teacher: true },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.subject.count({ where: query }),
  ]);

  // Convert teacherSubjects → teachers[]
  const data: SubjectList[] = rawData.map((subj) => ({
    ...subj,
    teachers: subj.teacherSubjects.map((ts) => ts.teacher),
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">

      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Subjects</h1>

        {/* <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch /> */}

          {/* <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>

            {role === "admin" && (
              <FormContainer table="subject" type="create" />
            )}
          </div> */}
        {/* </div> */}
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default SubjectListPage;
