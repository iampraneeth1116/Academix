"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";


type ExamFormValues = {
  id?: number | undefined;
  title: string;
  startTime: string; 
  endTime: string;
  lessonId: string;
};

const ExamForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<ExamSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { lessons: { id: number; name: string }[] };
}) => {
  const lessons = relatedData?.lessons ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema) as any, // TS-safe cast
    defaultValues: {
      title: data?.title ?? "",
      startTime: data?.startTime
        ? new Date(data.startTime).toISOString().slice(0, 16)
        : "",
      endTime: data?.endTime
        ? new Date(data.endTime).toISOString().slice(0, 16)
        : "",
      lessonId: data?.lessonId ? String(data.lessonId) : "",
      id: data?.id,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createExam : updateExam,
    { success: false, error: false }
  );

  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    const formatted: ExamSchema = {
      id: formData.id ? Number(formData.id) : undefined,
      title: formData.title,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      lessonId: Number(formData.lessonId),
    };

    formAction(formatted);
  });

  useEffect(() => {
    if (state.success) {
      toast(`Exam has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam" : "Update the exam"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Exam title"
          name="title"
          register={register}
          error={errors.title as any}
        />

        <InputField
          label="Start Date"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors.startTime as any}
        />

        <InputField
          label="End Date"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors.endTime as any}
        />

        {type === "update" && (
          <input type="hidden" {...register("id")} />
        )}

        {/* Lesson Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>

          <select
            {...register("lessonId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>

          {errors.lessonId && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message?.toString()}
            </p>
          )}
        </div>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ExamForm;
