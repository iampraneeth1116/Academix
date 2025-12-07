"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const options = [
  { label: "Name (A → Z)", value: "name_asc" },
  { label: "Name (Z → A)", value: "name_desc" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

const TableSortDropdown = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const updateSort = (val: string) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("sort", val);
    router.push(`?${newParams.toString()}`);
  };

  return (
    <div className="relative">
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full bg-aYellow"
        onClick={() => setOpen(!open)}
      >
        <img src="/sort.png" width={14} height={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 bg-white shadow-md rounded p-3 w-40 z-20">
          {options.map((o) => (
            <p
              key={o.value}
              className={`text-sm p-1 cursor-pointer hover:bg-gray-100 rounded ${
                params.get("sort") === o.value ? "font-semibold" : ""
              }`}
              onClick={() => updateSort(o.value)}
            >
              {o.label}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableSortDropdown;
