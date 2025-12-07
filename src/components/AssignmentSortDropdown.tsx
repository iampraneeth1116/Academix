"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const options = [
  { label: "Title (A → Z)", value: "title_asc" },
  { label: "Title (Z → A)", value: "title_desc" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

const AnnouncementSortDropdown = () => {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);

  const updateSort = (val: string) => {
    const p = new URLSearchParams(params.toString());
    p.set("sort", val);
    p.delete("page");
    router.push(`?${p.toString()}`);
  };

  return (
    <div className="relative">
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
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

export default AnnouncementSortDropdown;
