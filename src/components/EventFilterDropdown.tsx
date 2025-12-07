"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function EventFilterDropdown({ classes }: any) {
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
        <div className="absolute right-0 top-10 bg-white shadow-md rounded-md p-3 w-44 z-20">
          <p className="text-xs font-semibold mb-1">Filter by Class</p>
          <select
            className="border p-1 w-full text-sm"
            onChange={(e) => update("classId", e.target.value)}
            defaultValue={params.get("classId") || "all"}
          >
            <option value="all">All Classes</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
