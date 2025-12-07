"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const TableSearch = () => {
  const params = useSearchParams();
  const router = useRouter();

  const [value, setValue] = useState(params.get("search") || "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const p = new URLSearchParams(params.toString());

      if (!value.trim()) p.delete("search");
      else p.set("search", value);

      p.delete("page");
      router.push(`?${p.toString()}`);
    }, 400);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      className="border px-3 py-2 rounded"
      placeholder="Search..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default TableSearch;
