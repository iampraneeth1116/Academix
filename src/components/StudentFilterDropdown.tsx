"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const StudentFilterDropdown = ({ classes, grades }: any) => {
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
        <div className="absolute right-0 top-10 bg-white shadow-md rounded-md p-3 w-48 z-20">
          <p className="text-xs font-semibold mb-1">Filter by Class</p>
          <select
            className="border p-1 text-sm w-full"
            onChange={(e) => updateFilter("classId", e.target.value)}
            defaultValue={params.get("classId") || "all"}
          >
            <option value="all">All Classes</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <p className="text-xs font-semibold mb-1 mt-3">Filter by Grade</p>
          <select
            className="border p-1 text-sm w-full"
            onChange={(e) => updateFilter("gradeId", e.target.value)}
            defaultValue={params.get("gradeId") || "all"}
          >
            <option value="all">All Grades</option>
            {grades.map((g: any) => (
              <option key={g.id} value={g.id}>
                {g.level}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default StudentFilterDropdown;
