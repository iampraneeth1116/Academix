"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const TableFilterDropdown = ({ subjects, classes }: any) => {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());

    // 🔥 Optional filter: if "all", remove it → prevents blocking data
    if (value === "all") newParams.delete(key);
    else newParams.set(key, value);

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
          {/* SUBJECT FILTER */}
          <p className="text-xs font-semibold mb-1">Filter by Subject</p>
          <select
            className="border p-1 text-sm w-full"
            onChange={(e) => updateFilter("subjectId", e.target.value)}
            defaultValue={params.get("subjectId") || "all"}
          >
            <option value="all">All Subjects</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* CLASS FILTER */}
          <p className="text-xs font-semibold mb-1 mt-3">Filter by Class</p>
          <select
            className="border p-1 text-sm w-full"
            onChange={(e) => updateFilter("classId", e.target.value)}
            defaultValue={params.get("classId") || "all"}
          >
            <option value="all">All Classes</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default TableFilterDropdown;
