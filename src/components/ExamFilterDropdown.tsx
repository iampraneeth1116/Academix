"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const ExamFilterDropdown = ({ subjects, classes, teachers }: any) => {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const update = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value === "all") p.delete(key);
    else p.set(key, value);
    p.delete("page");
    router.push(`?${p.toString()}`);
  };

  return (
    <div className="relative">
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full bg-aYellow"
        onClick={() => setOpen(!open)}
      >
        <img src="/filter.png" width={14} height={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 bg-white shadow-md rounded p-3 w-48 z-20">

          <p className="text-xs mb-1 font-semibold">Filter by Subject</p>
          <select
            className="border p-1 text-sm w-full"
            defaultValue={params.get("subjectId") || "all"}
            onChange={(e) => update("subjectId", e.target.value)}
          >
            <option value="all">All Subjects</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <p className="text-xs mb-1 mt-3 font-semibold">Filter by Class</p>
          <select
            className="border p-1 text-sm w-full"
            defaultValue={params.get("classId") || "all"}
            onChange={(e) => update("classId", e.target.value)}
          >
            <option value="all">All Classes</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <p className="text-xs mb-1 mt-3 font-semibold">Filter by Teacher</p>
          <select
            className="border p-1 text-sm w-full"
            defaultValue={params.get("teacherId") || "all"}
            onChange={(e) => update("teacherId", e.target.value)}
          >
            <option value="all">All Teachers</option>
            {teachers.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name} {t.surname}</option>
            ))}
          </select>

        </div>
      )}
    </div>
  );
};

export default ExamFilterDropdown;
