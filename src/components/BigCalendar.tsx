"use client";

import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { calendarEvents } from "@/lib/data";

const localizer = momentLocalizer(moment);

const BigCalendar = () => {
  const [view, setView] = useState<View>("work_week");

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  return (
    <div className="h-[90vh] w-full p-4">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        view={view}
        views={["work_week", "day", "month", "week"]}
        onView={handleOnChangeView}
        min={new Date(2025, 0, 1, 8, 0, 0)}
        max={new Date(2025, 0, 1, 17, 0, 0)}
        style={{ height: "100%", backgroundColor: "white", borderRadius: "12px" }}
      />
    </div>
  );
};

export default BigCalendar;
