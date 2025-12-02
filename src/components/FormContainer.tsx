import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};


  const cookiesStore = await cookies();
  const token = cookiesStore.get("accessToken")?.value;

  let role: "admin" | "teacher" | "student" | "parent" | "guest" = "guest";
  let currentUserId: string | null = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      role = decoded.role.toLowerCase(); 
      currentUserId = decoded.id;
    } catch (err) {
      role = "guest";
    }
  }


  if (type !== "delete") {
    switch (table) {
      case "subject":
        relatedData = {
          teachers: await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          }),
        };
        break;

      case "class":
        relatedData = {
          teachers: await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          }),
          grades: await prisma.grade.findMany({
            select: { id: true, level: true },
          }),
        };
        break;

      case "teacher":
        relatedData = {
          subjects: await prisma.subject.findMany({
            select: { id: true, name: true },
          }),
        };
        break;

      case "student":
        relatedData = {
          grades: await prisma.grade.findMany({ select: { id: true, level: true } }),
          classes: await prisma.class.findMany({
            include: { _count: { select: { students: true } } },
          }),
        };
        break;

      case "exam":
        relatedData = {
          lessons: await prisma.lesson.findMany({
            where: role === "teacher" ? { teacherId: currentUserId! } : {},
            select: { id: true, name: true },
          }),
        };
        break;

      default:
        break;
    }
  }

  return (
    <div>
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
