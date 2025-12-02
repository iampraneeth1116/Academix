"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ClassForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<ClassSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { teachers: { id: string; name: string; surname: string }[]; grades: { id: number; level: number }[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: data?.name ?? "",
      capacity: data?.capacity ?? "",
      supervisorId: data?.supervisorId ?? "",
      gradeId: data?.gradeId ?? "",
      id: data?.id ?? undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createClass : updateClass,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((formData) => {
    formAction(formData as any);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Class has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen, type]);

  const { teachers = [], grades = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new class" : "Update the class"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Class name"
          name="name"
          register={register}
          error={errors?.name} />

        <InputField
          label="Capacity"
          name="capacity"
          register={register}
          error={errors?.capacity}
        />

        {type === "update" && (
          <input type="hidden" {...register("id")} value={data?.id as any} />
        )}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Supervisor</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("supervisorId")}
            defaultValue={data?.supervisorId ?? ""}
          >
            <option value="">Select supervisor</option>
            {teachers.map((teacher) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name + " " + teacher.surname}
              </option>
            ))}
          </select>

          {errors.supervisorId?.message && (
            <p className="text-xs text-red-400">
              {errors.supervisorId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId ?? ""}
          >
            <option value="">Select grade</option>
            {grades.map((grade) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>

          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
      </div>

      {state.error && <span className="text-red-500">Something went wrong!</span>}

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ClassForm;
