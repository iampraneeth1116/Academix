"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";


const schema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  bloodType: z.string().min(1),
  birthday: z.string().min(1),
  sex: z.enum(["male", "female"]),
  img: z.any().optional(),
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

const TeacherForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const load = async () => {
      const s = await fetch("/api/subjects").then((r) => r.json());
      const c = await fetch("/api/classes").then((r) => r.json());
      setSubjects(s);
      setClasses(c);
    };
    load();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      ...formData,
      birthday: new Date(formData.birthday),
      img: formData.img?.[0] ? formData.img[0].name : null,
    };

    const res = await fetch("/api/teacher", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.refresh();
      setOpen?.(false);
    } else {
      alert("Failed to create teacher");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Create a new teacher</h1>

      {/* Authentication */}
      <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Username" name="username" register={register} error={errors.username} required/>
        <InputField label="Email" name="email" register={register} error={errors.email} required/>
        <InputField label="Password" name="password" type="password" register={register} error={errors.password} required/>
      </div>

      {/* Personal */}
      <span className="text-xs text-gray-400 font-medium">Personal Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="First Name" name="firstName" register={register} error={errors.firstName} required/>
        <InputField label="Last Name" name="lastName" register={register} error={errors.lastName} />
        <InputField label="Phone" name="phone" register={register} error={errors.phone} required/>
        <InputField label="Address" name="address" register={register} error={errors.address} required/>
        <InputField label="Blood Type" name="bloodType" register={register} error={errors.bloodType} required/>
        <InputField label="Birthday" name="birthday" type="date" register={register} error={errors.birthday} required/>

        {/* Sex */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select {...register("sex")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Subjects Dropdown */}
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Subject (optional)</label>
          <select {...register("subjectId")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm">
            <option value="">Select Subject</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Classes Dropdown */}
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Class (optional)</label>
          <select {...register("classId")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm">
            <option value="">Select Class</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;
