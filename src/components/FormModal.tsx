// components/FormModal.tsx
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { JSX, Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";

// DYNAMIC IMPORTS (LAZY LOAD FOR BETTER PERFORMANCE)
const TeacherForm = dynamic(() => import("./forms/TeacherForm"));
const StudentForm = dynamic(() => import("./forms/StudentForm"));
const SubjectForm = dynamic(() => import("./forms/SubjectForm"));
const ClassForm = dynamic(() => import("./forms/ClassForm"));
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"));
const ExamForm = dynamic(() => import("./forms/ExamForm"));

// MAP TABLE → FORM COMPONENT
const forms: Record<
  string,
  (
    type: "create" | "update",
    data: any,
    setOpen: Dispatch<SetStateAction<boolean>>,
    relatedData?: any
  ) => JSX.Element
> = {
  teacher: (type, data, setOpen, relatedData) => (
    <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  student: (type, data, setOpen, relatedData) => (
    <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  subject: (type, data, setOpen, relatedData) => (
    <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  class: (type, data, setOpen, relatedData) => (
    <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  assignment: (type, data, setOpen, relatedData) => (
    <AssignmentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  exam: (type, data, setOpen, relatedData) => (
    <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: {
  table: string;
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // ---------------- DELETE HANDLER ---------------- //
  const handleDelete = async () => {
    if (!id) return;

    try {
      const res = await fetch(`/api/${table}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Delete failed!");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  // ---------------- RENDER FORM ---------------- //
  const Form = () => {
    // DELETE MODAL
    if (type === "delete" && id) {
      return (
        <div className="p-4 flex flex-col gap-4">
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>

          <button
            onClick={handleDelete}
            className="bg-red-600 text-white py-2 px-4 rounded-md mx-auto"
          >
            Delete
          </button>
        </div>
      );
    }

    // CREATE OR UPDATE MODAL
    if (type === "create" || type === "update") {
      if (!forms[table]) return <>Form not found!</>;
      return forms[table](type, data, setOpen, relatedData);
    }

    return <>Invalid action</>;
  };

  // ---------------- UI ---------------- //
  return (
    <>
      {/* OPEN MODAL BUTTON */}
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300"
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>

      {/* MODAL */}
      {open && (
        <div className="w-screen h-screen absolute inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[60%] lg:w-[40%] animate-fadeIn">
            <Form />

            {/* CLOSE ICON */}
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="close" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
