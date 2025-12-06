"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ----------------------
// VALIDATION SCHEMA
// ----------------------
const schema = z.object({
  username: z.string().min(3, "Minimum 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),  // optional for UPDATE
  name: z.string().min(1),
  surname: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().min(1),
  bloodType: z.string().min(1),
  birthday: z.string().min(1),
  sex: z.enum(["MALE", "FEMALE"]),
  img: z.any().optional(),

  // REQUIRED FIX
  subjectId: z.string().optional(),
  classId: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

type TeacherFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
};

const TeacherForm = ({ type, data, setOpen, relatedData }: TeacherFormProps) => {
  const router = useRouter();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const s = await fetch("/api/subjects").then((r) => r.json());
      const c = await fetch("/api/classes").then((r) => r.json());
      setSubjects(s);
      setClasses(c);
    };
    load();
  }, []);

  // ----------------------
  // FORM + DEFAULT VALUES
  // ----------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues:
      type === "update"
        ? {
            username: data.username,
            email: data.email ?? "",
            password: "",
            name: data.name,
            surname: data.surname ?? "",
            phone: data.phone ?? "",
            address: data.address,
            bloodType: data.bloodType,
            birthday: new Date(data.birthday).toISOString().split("T")[0],
            sex: data.sex,
            subjectId: data.subjectId ?? "",
            classId: data.classId ?? "",
          }
        : {},
  });

  // ----------------------
  // SUBMIT HANDLER
  // ----------------------
  const onSubmit = handleSubmit(async (formData) => {
    const payload: any = {
      ...formData,
      birthday: new Date(formData.birthday),
      img: formData.img?.[0]?.name || data?.img || null,
    };

    // If updating and password was NOT changed → remove it
    if (type === "update" && !formData.password) {
      delete payload.password;
    }

    const method = type === "create" ? "POST" : "PUT";
    const url = type === "create" ? "/api/teacher" : `/api/teacher/${data.id}`;

    const res = await fetch(url, {
      method,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.refresh();
      setOpen?.(false);
    } else {
      alert(type === "create" ? "Failed to create teacher" : "Failed to update teacher");
    }
  });

  // ----------------------
  // RENDER UI
  // ----------------------
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update teacher"}
      </h1>

      {/* AUTH BLOCK */}
      <span className="text-xs text-gray-400 font-medium">Authentication Details</span>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          register={register}
          error={errors.username}
          required
        />

        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors.email}
          required
        />

        <InputField
          label={type === "create" ? "Password" : "Password (leave empty to keep)"}
          name="password"
          type="password"
          register={register}
          error={errors.password}
        />
      </div>

      {/* PERSONAL INFO */}
      <span className="text-xs text-gray-400 font-medium">Personal Information</span>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          register={register}
          error={errors.name}
          required
        />

        <InputField
          label="Last Name"
          name="surname"
          register={register}
          error={errors.surname}
        />

        <InputField label="Phone" name="phone" register={register} error={errors.phone} />

        <InputField
          label="Address"
          name="address"
          register={register}
          error={errors.address}
          required
        />

        <InputField
          label="Blood Type"
          name="bloodType"
          register={register}
          error={errors.bloodType}
          required
        />

        <InputField
          label="Birthday"
          type="date"
          name="birthday"
          register={register}
          error={errors.birthday}
          required
        />

        {/* Sex */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            {...register("sex")}
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        {/* Subject Dropdown */}
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Subject (optional)</label>
          <select
            {...register("subjectId")}
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Class Dropdown */}
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Class (optional)</label>
          <select
            {...register("classId")}
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="bg-blue-500 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;
