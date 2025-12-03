"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = ({ classId }: { classId?: number }) => {
  const [value, onChange] = useState<Value>(new Date());
  const router = useRouter();

  useEffect(() => {
    if (value instanceof Date) {
      const dateParam = value.toISOString().split("T")[0];
      const query = classId ? `?date=${dateParam}&classId=${classId}` : `?date=${dateParam}`;
      router.replace(query);
    }
  }, [value, router, classId]);

  return <Calendar onChange={onChange} value={value} />;
};

export default EventCalendar;
