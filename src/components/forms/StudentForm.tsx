"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
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
  sex: z.enum(["MALE", "FEMALE"]),
  gradeId: z.string(),
  classId: z.string(),
});

type Inputs = z.infer<typeof schema>;

const StudentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen?: any;
  relatedData?: any;
}) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: data?.username ?? "",
      email: data?.email ?? "",
      password: "",
      firstName: data?.name ?? "",
      lastName: data?.surname ?? "",
      phone: data?.phone ?? "",
      address: data?.address ?? "",
      bloodType: data?.bloodType ?? "",
      birthday: data?.birthday
        ? new Date(data.birthday).toISOString().slice(0, 10)
        : "",
      sex: data?.sex ?? "MALE",
      gradeId: "",
      classId: "",
    },
  });

  const onSubmit = handleSubmit(async (formData) => {
    const res = await fetch("/api/student", {
      method: type === "create" ? "POST" : "PUT",
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      alert("Failed to save student!");
      return;
    }

    setOpen(false);
    router.refresh();
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update student"}
      </h1>

      {/* AUTH INFO */}
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>

      <div className="flex flex-wrap gap-4">
        <InputField label="Username" name="username" register={register} error={errors.username} required/>
        <InputField label="Email" name="email" register={register} error={errors.email} required/>
        <InputField label="Password" name="password" type="password" register={register} error={errors.password} required/>
      </div>

      {/* PERSONAL INFO */}
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>

      <div className="flex flex-wrap gap-4">
        <InputField label="First Name" name="firstName" register={register} error={errors.firstName} required/>
        <InputField label="Last Name" name="lastName" register={register} error={errors.lastName}/>
        <InputField label="Phone" name="phone" register={register} error={errors.phone} required/>
        <InputField label="Address" name="address" register={register} error={errors.address} required/>
        <InputField label="Blood Type" name="bloodType" register={register} error={errors.bloodType} required/>

        <InputField label="Birthday" name="birthday" type="date" register={register} error={errors.birthday} required/>

        {/* SEX */}
        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-xs text-gray-500">Sex</label>
          <select {...register("sex")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        {/* GRADE */}
        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-xs text-gray-500">Grade</label>
          <select {...register("gradeId")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md">
            {relatedData.grades.map((g: any) => (
              <option key={g.id} value={g.id}>
                Grade {g.level}
              </option>
            ))}
          </select>
        </div>

        {/* CLASS */}
        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-xs text-gray-500">Class</label>
          <select {...register("classId")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md">
            {relatedData.classes.map((cls: any) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="bg-blue-500 text-white py-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;
