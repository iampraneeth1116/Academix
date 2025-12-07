"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const schema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  classId: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

export default function AnnouncementForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues:
      type === "update"
        ? {
            title: data.title,
            description: data.description,
            date: new Date(data.date).toISOString().split("T")[0],
            classId: data.classId?.toString() ?? "",
          }
        : {},
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      classId: formData.classId ? Number(formData.classId) : null,
    };

    const method = type === "create" ? "POST" : "PUT";
    const url =
      type === "create"
        ? "/api/announcement"
        : `/api/announcement/${data.id}`;

    const res = await fetch(url, {
      method,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.refresh();
      setOpen(false);
    } else {
      alert("Failed to save announcement");
    }
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-lg font-semibold">
        {type === "create" ? "Create Announcement" : "Update Announcement"}
      </h1>

      <InputField
        label="Title"
        name="title"
        register={register}
        error={errors.title}
        required
      />

      <InputField
        label="Description"
        name="description"
        register={register}
        error={errors.description}
        required
      />

      <InputField
        label="Date"
        type="date"
        name="date"
        register={register}
        error={errors.date}
        required
      />

      {/* Class Dropdown */}
      <div>
        <label className="text-xs font-medium">Class (optional)</label>
        <select
          {...register("classId")}
          className="ring-1 ring-gray-300 p-2 rounded-md w-full"
        >
          <option value="">All Classes</option>
          {relatedData.classes.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <button className="bg-blue-500 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
}
