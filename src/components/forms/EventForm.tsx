"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EventForm({
  type,
  data,
  setOpen,
  relatedData,
}: any) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: data?.title || "",
    description: data?.description || "",
    startTime: data?.startTime
      ? new Date(data.startTime).toISOString().slice(0, 16)
      : "",
    endTime: data?.endTime
      ? new Date(data.endTime).toISOString().slice(0, 16)
      : "",
    classId: data?.classId?.toString() || "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      description: form.description,
      startTime: form.startTime,
      endTime: form.endTime,
      classId: form.classId ? Number(form.classId) : null,
    };

    const method = type === "create" ? "POST" : "PUT";
    const url =
      type === "create"
        ? "/api/event"
        : `/api/event/${data.id}`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return alert("Failed");

    router.refresh();
    setOpen(false);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <h1 className="text-lg font-semibold">
        {type === "create" ? "Create Event" : "Update Event"}
      </h1>

      {/* Title */}
      <input
        className="ring-1 ring-gray-300 p-2 rounded-md"
        placeholder="Event Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />

      {/* Description */}
      <textarea
        className="ring-1 ring-gray-300 p-2 rounded-md"
        placeholder="Description"
        value={form.description}
        rows={3}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      {/* Start + End */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="datetime-local"
          className="ring-1 ring-gray-300 p-2 rounded-md flex-1"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          required
        />

        <input
          type="datetime-local"
          className="ring-1 ring-gray-300 p-2 rounded-md flex-1"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          required
        />
      </div>

      {/* Class Dropdown */}
      <select
        className="ring-1 ring-gray-300 p-2 rounded-md"
        value={form.classId}
        onChange={(e) => setForm({ ...form, classId: e.target.value })}
      >
        <option value="">No Class</option>
        {relatedData.classes.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button className="bg-blue-500 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
}
