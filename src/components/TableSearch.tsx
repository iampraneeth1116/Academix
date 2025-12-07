"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TableSearch = () => {
  const params = useSearchParams();
  const router = useRouter();

  // Get initial search from URL
  const initialSearch = params.get("search") || "";
  const [value, setValue] = useState(initialSearch);

  useEffect(() => {
    const delay = setTimeout(() => {
      const newParams = new URLSearchParams(params.toString());

      if (value.trim() === "") {
        newParams.delete("search");
      } else {
        newParams.set("search", value);
      }

      newParams.delete("page"); // reset to page 1 on new search

      router.push(`?${newParams.toString()}`);
    }, 300); // debounce duration

    return () => clearTimeout(delay);
  }, [value]);

  return (
    <input
      type="text"
      placeholder="Search teacher name..."
      className="px-3 py-2 border rounded-md text-sm"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default TableSearch;
