import prisma from "@/lib/prisma";
import FormModal from "./FormModal";

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
  role?: "admin" | "teacher" | "student" | "parent" | "guest";
  currentUserId?: string | null;
};

const FormContainer = async ({
  table,
  type,
  data,
  id,
  role = "guest",
  currentUserId = null,
}: FormContainerProps) => {
  let relatedData: any = {};

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

      case "assignment":
        relatedData = {
          subjects: await prisma.subject.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          }),
          lessons: await prisma.lesson.findMany({
            where:
              role === "teacher" && currentUserId
                ? { teacherId: currentUserId }
                : {},
            select: {
              id: true,
              name: true,
              subjectId: true,
              classId: true,
              day: true,
              startTime: true,
              endTime: true,
              teacherId: true,
            },
          }),
        };
        break;

      case "event":
        relatedData = {
          classes: await prisma.class.findMany({
            select: { id: true, name: true },
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
          grades: await prisma.grade.findMany({
            select: { id: true, level: true },
          }),
          classes: await prisma.class.findMany({
            select: { id: true, name: true },
          }),
        };
        break;

      case "exam":
        relatedData = {
          subjects: await prisma.subject.findMany({
            select: { id: true, name: true },
          }),
          lessons: await prisma.lesson.findMany({
            where:
              role === "teacher" && currentUserId
                ? { teacherId: currentUserId }
                : {},
            select: {
              id: true,
              name: true,
              day: true,
              startTime: true,
              endTime: true,
              subjectId: true,
              classId: true,
              teacherId: true,
            },
          }),
        };
        break;
        case "announcement":
          relatedData = {
            classes: await prisma.class.findMany({
              select: { id: true, name: true },
            }),
          };
          break;

      case "lesson":
        relatedData = {
          subjects: await prisma.subject.findMany(),
          classes: await prisma.class.findMany(),
          teachers: await prisma.teacher.findMany(),
        };
        break;



      case "result":
        relatedData = {
          students: await prisma.student.findMany({
            select: { id: true, name: true, surname: true },
            orderBy: { name: "asc" },
          }),

          exams: await prisma.exam.findMany({
            include: {
              lesson: {
                include: {
                  class: true,
                },
              },
            },
            orderBy: { title: "asc" },
          }),

          assignments: await prisma.assignment.findMany({
            include: {
              lesson: {
                include: {
                  class: true,
                },
              },
            },
            orderBy: { title: "asc" },
          }),
        };
        break;
    }
  }

  return (
    <FormModal
      table={table}
      type={type}
      data={data}
      id={id}
      relatedData={relatedData}
    />
  );
};

export default FormContainer;
