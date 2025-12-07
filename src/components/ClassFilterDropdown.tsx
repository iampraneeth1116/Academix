"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const ClassFilterDropdown = ({ supervisors, grades }: any) => {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());

    if (value === "all") newParams.delete(key);
    else newParams.set(key, value);

    newParams.delete("page");
    router.push(`?${newParams.toString()}`);
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
        <div className="absolute right-0 top-10 bg-white shadow-md rounded-md p-3 w-44 z-20">
          <p className="text-xs font-semibold mb-1">Filter by Grade</p>
          <select
            className="border p-1 w-full text-sm"
            onChange={(e) => updateFilter("gradeId", e.target.value)}
            defaultValue={params.get("gradeId") || "all"}
          >
            <option value="all">All Grades</option>
            {grades.map((g: any) => (
              <option key={g.id} value={g.id}>{g.level}</option>
            ))}
          </select>

          <p className="text-xs font-semibold mt-3 mb-1">Filter by Supervisor</p>
          <select
            className="border p-1 w-full text-sm"
            onChange={(e) => updateFilter("supervisorId", e.target.value)}
            defaultValue={params.get("supervisorId") || "all"}
          >
            <option value="all">All Supervisors</option>
            {supervisors.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} {s.surname}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default ClassFilterDropdown;
