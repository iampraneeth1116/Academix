import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalendar";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const dataRes = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number }),
    },
    select: {
      name: true,
      startTime: true,
      endTime: true,
    },
  });

  const data = dataRes.map((lesson) => ({
    title: lesson.name,
    start: new Date(lesson.startTime),
    end: new Date(lesson.endTime),
  }));

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div>
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
