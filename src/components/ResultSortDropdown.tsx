"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const options = [
  { label: "Title (A → Z)", value: "title_asc" },
  { label: "Title (Z → A)", value: "title_desc" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

const ResultSortDropdown = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const updateSort = (v: string) => {
    const p = new URLSearchParams(params.toString());
    p.set("sort", v);
    p.delete("page");
    router.push(`?${p.toString()}`);
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
        <div className="absolute top-10 right-0 bg-white rounded shadow p-3 w-44 z-20">
          {options.map((o) => (
            <p
              key={o.value}
              onClick={() => updateSort(o.value)}
              className={`p-1 text-sm cursor-pointer hover:bg-gray-100 rounded ${
                params.get("sort") === o.value ? "font-semibold" : ""
              }`}
            >
              {o.label}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultSortDropdown;
