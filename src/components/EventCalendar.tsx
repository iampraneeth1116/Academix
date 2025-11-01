"use client";

import Image from "next/image";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./EventCalendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const events = [
  {
    id: 1,
    title: "Project Submission",
    time: "10:00 AM - 11:00 AM",
    description: "Submit your final group project via the dashboard.",
  },
  {
    id: 2,
    title: "Math Workshop",
    time: "1:30 PM - 2:30 PM",
    description: "Join the extra practice session on algebra and geometry.",
  },
  {
    id: 3,
    title: "Team Meeting",
    time: "3:00 PM - 3:45 PM",
    description: "Discuss upcoming science fair ideas with your team.",
  },
];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Event Calendar</h1>
        <Image src="/moreDark.png" alt="menu" width={22} height={22} />
      </div>

      <Calendar
        onChange={onChange}
        value={value}
        className="academic-calendar"
        showNeighboringMonth={false}
      />

      <h2 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Upcoming Events</h2>

      <div className="flex flex-col gap-4">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`event-card border-l-4 p-4 rounded-xl shadow-sm transition-all hover:shadow-md ${
              index % 3 === 0
                ? "border-l-blue-400 bg-blue-50"
                : index % 3 === 1
                ? "border-l-purple-400 bg-purple-50"
                : "border-l-amber-400 bg-amber-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">{event.title}</h3>
              <span className="text-gray-400 text-xs">{event.time}</span>
            </div>
            <p className="mt-2 text-gray-500 text-sm">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar
