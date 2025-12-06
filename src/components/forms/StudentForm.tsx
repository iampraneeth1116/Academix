// components/forms/StudentForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().optional(), // optional on update
  name: z.string().min(1),
  surname: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().min(1),
  bloodType: z.string().min(1),
  birthday: z.string().min(1),
  sex: z.enum(["MALE", "FEMALE"]),
  gradeId: z.string().optional(),
  classId: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

type StudentFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
};

const StudentForm = ({ type, data, setOpen, relatedData }: StudentFormProps) => {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: type === "update" ? {
      username: data.username,
      email: data.email ?? "",
      password: "",
      name: data.name,
      surname: data.surname ?? "",
      phone: data.phone ?? "",
      address: data.address,
      bloodType: data.bloodType,
      birthday: data.birthday ? new Date(data.birthday).toISOString().slice(0,10) : "",
      sex: data.sex ?? "MALE",
      gradeId: data.gradeId ? String(data.gradeId) : "",
      classId: data.classId ? String(data.classId) : "",
    } : {},
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = { ...formData, birthday: new Date(formData.birthday) };

    if (type === "update" && !formData.password) delete (payload as any).password;

    const method = type === "create" ? "POST" : "PUT";
    const url = type === "create" ? "/api/student" : `/api/student/${data.id}`;

    const res = await fetch(url, { method, body: JSON.stringify(payload) });

    if (!res.ok) {
      const txt = await res.text();
      alert("Save failed: " + txt);
      return;
    }

    setOpen?.(false);
    router.refresh();
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h2 className="text-lg font-semibold">{type === "create" ? "Create Student" : "Update Student"}</h2>

      <div className="flex flex-wrap gap-4">
        <InputField label="Username" name="username" register={register} error={errors.username} required />
        <InputField label="Email" name="email" register={register} error={errors.email} required />
        <InputField label={type === "create" ? "Password" : "Password (leave empty)"} name="password" type="password" register={register} error={errors.password} />
      </div>

      <div className="flex flex-wrap gap-4">
        <InputField label="First Name" name="name" register={register} error={errors.name} required />
        <InputField label="Last Name" name="surname" register={register} error={errors.surname} />
        <InputField label="Phone" name="phone" register={register} error={errors.phone} />
        <InputField label="Address" name="address" register={register} error={errors.address} required />
        <InputField label="Blood Type" name="bloodType" register={register} error={errors.bloodType} required />
        <InputField label="Birthday" name="birthday" type="date" register={register} error={errors.birthday} required />

        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-xs text-gray-500">Sex</label>
          <select {...register("sex")} className="ring-1 ring-gray-300 p-2 rounded-md">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-xs text-gray-500">Grade</label>
          <select {...register("gradeId")} className="ring-1 ring-gray-300 p-2 rounded-md">
            {relatedData?.grades?.map((g: any) => <option key={g.id} value={g.id}>{g.level}th</option>)}
          </select>
        </div>

        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-xs text-gray-500">Class</label>
          <select {...register("classId")} className="ring-1 ring-gray-300 p-2 rounded-md">
            {relatedData?.classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
