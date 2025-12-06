"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

export default function AssignmentForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: any;
}) {
  const router = useRouter();

  const { register, handleSubmit } = useForm({
    defaultValues: type === "update" ? data : {},
  });

  const onSubmit = async (formData: any) => {
    const url =
      type === "create"
        ? "/api/assignment"
        : `/api/assignment/${data.id}`;

    const method = type === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      alert("Failed");
      return;
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">

      {/* TITLE */}
      <input
        placeholder="Assignment Title"
        {...register("title")}
        className="border p-2 rounded"
        required
      />

      {/* LESSON DROPDOWN */}
      <select {...register("lessonId")} className="border p-2 rounded" required>
        <option value="">Select Lesson</option>
        {relatedData.lessons.map((l: any) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>

      {/* START DATE */}
      <label className="text-sm">Start Date</label>
      <input
        type="datetime-local"
        {...register("startDate")}
        className="border p-2 rounded"
        required
      />

      {/* DUE DATE */}
      <label className="text-sm">Due Date</label>
      <input
        type="datetime-local"
        {...register("dueDate")}
        className="border p-2 rounded"
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded-md"
      >
        {type === "create" ? "Create Assignment" : "Update Assignment"}
      </button>
    </form>
  );
}
