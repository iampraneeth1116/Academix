"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const schema = z.object({
  name: z.string().min(1, "Lesson name required"),
  subjectId: z.string().min(1, "Required"),
  classId: z.string().min(1, "Required"),
  teacherId: z.string().min(1, "Required"),
  day: z.string().min(1, "Required"),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().min(1, "Required"),
});

type Inputs = z.infer<typeof schema>;

export default function LessonForm({ type, data, setOpen, relatedData }: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: any;
}) {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: type === "update" ? {
      name: data.name,
      subjectId: data.subjectId.toString(),
      classId: data.classId.toString(),
      teacherId: data.teacherId,
      day: data.day,
      startTime: new Date(data.startTime).toISOString().slice(0, 16),
      endTime: new Date(data.endTime).toISOString().slice(0, 16),
    } : {}
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      name: formData.name,
      subjectId: Number(formData.subjectId),
      classId: Number(formData.classId),
      teacherId: formData.teacherId,
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };

    const method = type === "create" ? "POST" : "PUT";
    const url = type === "create" ? "/api/lesson" : `/api/lesson/${data.id}`;

    const res = await fetch(url, {
      method,
      body: JSON.stringify(payload),
    });

    if (!res.ok) return alert("Failed to save lesson");

    router.refresh();
    setOpen(false);
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-lg font-semibold">
        {type === "create" ? "Create Lesson" : "Update Lesson"}
      </h1>

      {/* NAME */}
      <InputField
        label="Lesson Name"
        name="name"
        register={register}
        error={errors.name}
        required
      />

      {/* SUBJECT */}
      <div>
        <label className="text-xs text-gray-600">Subject</label>
        <select {...register("subjectId")} className="ring-1 ring-gray-300 p-2 rounded-md w-full">
          <option value="">Select Subject</option>
          {relatedData.subjects.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* CLASS */}
      <div>
        <label className="text-xs text-gray-600">Class</label>
        <select {...register("classId")} className="ring-1 ring-gray-300 p-2 rounded-md w-full">
          <option value="">Select Class</option>
          {relatedData.classes.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* TEACHER */}
      <div>
        <label className="text-xs text-gray-600">Teacher</label>
        <select {...register("teacherId")} className="ring-1 ring-gray-300 p-2 rounded-md w-full">
          <option value="">Select Teacher</option>
          {relatedData.teachers.map((t: any) => (
            <option key={t.id} value={t.id}>{t.name} {t.surname}</option>
          ))}
        </select>
      </div>

      {/* DAY */}
      <div>
        <label className="text-xs text-gray-600">Day</label>
        <select {...register("day")} className="ring-1 ring-gray-300 p-2 rounded-md w-full">
          <option value="">Select Day</option>
          <option value="MONDAY">Monday</option>
          <option value="TUESDAY">Tuesday</option>
          <option value="WEDNESDAY">Wednesday</option>
          <option value="THURSDAY">Thursday</option>
          <option value="FRIDAY">Friday</option>
        </select>
      </div>

      {/* TIMES */}
      <InputField
        label="Start Time"
        type="datetime-local"
        name="startTime"
        register={register}
        error={errors.startTime}
        required
      />

      <InputField
        label="End Time"
        type="datetime-local"
        name="endTime"
        register={register}
        error={errors.endTime}
        required
      />

      <button className="bg-blue-600 text-white py-2 rounded-md">
        {type === "create" ? "Create Lesson" : "Update Lesson"}
      </button>
    </form>
  );
}
