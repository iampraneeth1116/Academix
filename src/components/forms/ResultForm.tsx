"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const schema = z.object({
  studentId: z.string().min(1, "Select a student"),
  score: z.string().min(1, "Score required"),
  examId: z.string().optional(),
  assignmentId: z.string().optional(),
}).refine(
  (d) => d.examId || d.assignmentId,
  { message: "Choose either Exam OR Assignment", path: ["examId"] }
);

type Inputs = z.infer<typeof schema>;

export default function ResultForm({
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: data?.studentId ?? "",
      score: data?.score?.toString() ?? "",
      examId: data?.examId?.toString() ?? "",
      assignmentId: data?.assignmentId?.toString() ?? "",
    },
  });

  const examId = watch("examId");
  const assignmentId = watch("assignmentId");


  useEffect(() => {
    if (examId) {
      (document.querySelector("select[name='assignmentId']") as HTMLSelectElement).value = "";
    }
  }, [examId]);

  useEffect(() => {
    if (assignmentId) {
      (document.querySelector("select[name='examId']") as HTMLSelectElement).value = "";
    }
  }, [assignmentId]);

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      studentId: formData.studentId,
      score: Number(formData.score),
      examId: formData.examId ? Number(formData.examId) : null,
      assignmentId: formData.assignmentId ? Number(formData.assignmentId) : null,
    };

    const method = type === "create" ? "POST" : "PUT";
    const url = type === "create" ? "/api/result" : `/api/result/${data.id}`;

    const res = await fetch(url, {
      method,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      alert("Failed to save result");
    }
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add Result" : "Update Result"}
      </h1>

      {/* Student */}
      <div>
        <label className="text-xs font-medium">Student</label>
        <select {...register("studentId")} className="ring-1 ring-gray-300 p-2 rounded-md w-full">
          <option value="">Select Student</option>
          {relatedData.students.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.surname}
            </option>
          ))}
        </select>
        <p className="text-red-500 text-xs">{errors.studentId?.message}</p>
      </div>

      {/* Score */}
      <InputField
        label="Score"
        name="score"
        type="number"
        register={register}
        error={errors.score}
        required
      />

      {/* Exam */}
      <div>
        <label className="text-xs font-medium">Exam (optional)</label>
        <select {...register("examId")} className="ring-1 ring-gray-300 p-2 rounded-md w-full">
          <option value="">Select Exam</option>
          {relatedData.exams.map((e: any) => (
            <option key={e.id} value={e.id}>
              {e.title} — {e.lesson.class.name}
            </option>
          ))}
        </select>
      </div>

      {/* Assignment */}
      <div>
        <label className="text-xs font-medium">Assignment (optional)</label>
        <select
          {...register("assignmentId")}
          className="ring-1 ring-gray-300 p-2 rounded-md w-full"
        >
          <option value="">Select Assignment</option>
          {relatedData.assignments.map((a: any) => (
            <option key={a.id} value={a.id}>
              {a.title} — {a.lesson.class.name}
            </option>
          ))}
        </select>

        <p className="text-red-500 text-xs">{errors.examId?.message}</p>
      </div>

      <button className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
        {type === "create" ? "Create Result" : "Update Result"}
      </button>
    </form>
  );
}
