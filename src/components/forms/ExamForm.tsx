// components/forms/ExamForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examFormSchema, ExamFormValues } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Props = {
  type: "create" | "update";
  data?: Partial<ExamFormValues>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    subjects?: { id: number; name: string }[];
    lessons?: { id: number; name: string; subjectId: number }[];
  };
};

const ExamForm = ({ type, data, setOpen, relatedData }: Props) => {
  const router = useRouter();
  const subjects = relatedData?.subjects ?? [];
  const allLessons = relatedData?.lessons ?? [];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema) as any,
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      startTime: data?.startTime
        ? new Date(data.startTime).toISOString().slice(0, 16)
        : "",
      endTime: data?.endTime
        ? new Date(data.endTime).toISOString().slice(0, 16)
        : "",
      // if update, try to set lessonId
      lessonId: data?.lessonId ? String(data.lessonId) : "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createExam : updateExam,
    { success: false, error: false }
  );

  // controlled subject state derived from the selected lesson (if available)
  const selectedLessonId = watch("lessonId");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // compute lessons filtered by selectedSubject
  const filteredLessons = useMemo(() => {
    if (!selectedSubject) return allLessons;
    return allLessons.filter((l) => String(l.subjectId) === String(selectedSubject));
  }, [allLessons, selectedSubject]);

  // If user picks a lesson, ensure subject dropdown reflects it
  useEffect(() => {
    if (selectedLessonId) {
      const lesson = allLessons.find((l) => String(l.id) === String(selectedLessonId));
      if (lesson) setSelectedSubject(String(lesson.subjectId));
    }
  }, [selectedLessonId, allLessons]);

  const onSubmit = handleSubmit((formData) => {
    // transform to server shape
    const payload = {
      id: formData.id ?? undefined,
      title: formData.title,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      lessonId: Number(formData.lessonId),
    };

    formAction(payload);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`Exam ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      toast.error("Something went wrong");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success, state.error]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam" : "Update exam"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Title" name="title" register={register} error={errors.title as any} required />

        <InputField
          label="Start Time"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors.startTime as any}
          required
        />

        <InputField
          label="End Time"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors.endTime as any}
          required
        />

        {/* Subject dropdown */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>

          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              // reset lesson selection when subject changes
              // (we can't directly set react-hook-form value without setValue; keep simple: user picks lesson next)
            }}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lesson dropdown (filtered by selectedSubject) */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson <span className="text-red-500">*</span></label>

          <select
            {...register("lessonId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select lesson</option>
            {filteredLessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>

          {errors.lessonId && <p className="text-xs text-red-400">{errors.lessonId.message as string}</p>}
        </div>
      </div>

      {state.error && <p className="text-red-500 text-sm">Something went wrong!</p>}

      <button className="bg-blue-500 text-white py-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ExamForm;
