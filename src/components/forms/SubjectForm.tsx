"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";


type SubjectFormValues = {
  id?: number;
  name: string;
  teachers: string[];
};

const SubjectForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<SubjectSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { teachers: { id: string; name: string; surname: string }[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema) as any,
    defaultValues: {
      id: data?.id,
      name: data?.name ?? "",
      teachers: data?.teachers ?? [],
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createSubject : updateSubject,
    { success: false, error: false }
  );

  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    const formatted: SubjectSchema = {
      id: formData.id ? Number(formData.id) : undefined,
      name: formData.name,
      teachers: Array.isArray(formData.teachers)
        ? formData.teachers
        : [formData.teachers],
    };

    formAction(formatted);
  });

  useEffect(() => {
    if (state.success) {
      toast(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const teachers = relatedData?.teachers ?? [];

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new subject" : "Update the subject"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject name"
          name="name"
          register={register}
          error={errors.name as any}
        />

        {type === "update" && <input type="hidden" {...register("id")} />}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teachers</label>

          <select
            multiple
            {...register("teachers")}
            defaultValue={data?.teachers ?? []}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name + " " + t.surname}
              </option>
            ))}
          </select>

          {errors.teachers && (
            <p className="text-xs text-red-400">
              {errors.teachers.message?.toString()}
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

export default SubjectForm;
