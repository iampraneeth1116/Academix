"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { JSX, Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";

// --- DYNAMIC FORMS ---
const TeacherForm = dynamic(() => import("./forms/TeacherForm"));
const StudentForm = dynamic(() => import("./forms/StudentForm"));
const SubjectForm = dynamic(() => import("./forms/SubjectForm"));
const ClassForm = dynamic(() => import("./forms/ClassForm"));
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"));
const ExamForm = dynamic(() => import("./forms/ExamForm"));
const ResultForm = dynamic(() => import("./forms/ResultForm"));
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"));
const EventForm = dynamic(() => import("./forms/EventForm"));


// --- TABLE → FORM MAP ---
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
  announcement: (type, data, setOpen, relatedData) => (
    <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  exam: (type, data, setOpen, relatedData) => (
    <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),

  result: (type, data, setOpen, relatedData) => (
    <ResultForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
  
  event: (type, data, setOpen, relatedData) => (
    <EventForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
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

  // ---------------- DELETE ---------------- //
  const handleDelete = async () => {
    if (!id) return;

    try {
      const res = await fetch(`/api/${table}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Delete failed");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ---------------- FORM RENDERER --------------- //
  const Form = () => {
    if (type === "delete" && id) {
      return (
        <div className="p-4 flex flex-col gap-4">
          <p className="text-center">
            Are you sure you want to delete this <b>{table}</b>?
          </p>

          <button
            onClick={handleDelete}
            className="bg-red-600 text-white py-2 px-4 rounded-md mx-auto"
          >
            Delete
          </button>
        </div>
      );
    }

    if (type === "create" || type === "update") {
      if (!forms[table]) return <>Form not found</>;
      return forms[table](type, data, setOpen, relatedData);
    }

    return <>Invalid form</>;
  };

  // ---------------- UI ---------------- //
  return (
    <>
      {/* OPEN BUTTON */}
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400"
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[90%] md:w-[60%] lg:w-[40%] shadow-xl relative animate-fadeIn">

            <Form />

            {/* Close Button */}
            <button
              className="absolute top-4 right-4"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
