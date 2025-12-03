"use client";

import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
};

const BigCalendar = ({ data }: { data: CalendarEvent[] }) => {
  const [view, setView] = useState<View>("work_week");

  return (
    <div className="h-[90vh] min-h-[400px] w-full p-4">
      <Calendar
        localizer={localizer}
        events={data}
        startAccessor="start"
        endAccessor="end"
        view={view}
        views={["work_week", "day", "month", "week"]}
        onView={(v) => setView(v)}
        min={new Date(2025, 0, 1, 8, 0)}
        max={new Date(2025, 0, 1, 17, 0)}
        style={{ height: "100%", backgroundColor: "white", borderRadius: 12 }}
      />
    </div>
  );
};

export default BigCalendar;
