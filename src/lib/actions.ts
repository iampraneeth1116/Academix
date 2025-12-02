"use server";

import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { UserRole, UserType } from "@prisma/client";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";

type CurrentState = { success: boolean; error: boolean };



export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    const subject = await prisma.subject.create({
      data: { name: data.name },
    });

    if (data.teachers && data.teachers.length > 0) {
      const mapped = data.teachers
        .filter((t) => t)
        .map((teacherId) => ({
          teacherId,
          subjectId: subject.id,
        }));

      if (mapped.length > 0) {
        await prisma.teacherSubject.createMany({
          data: mapped,
          skipDuplicates: true,
        });
      }
    }

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: { id: data.id },
      data: { name: data.name },
    });

    await prisma.teacherSubject.deleteMany({
      where: { subjectId: data.id },
    });

    if (data.teachers && data.teachers.length > 0) {
      await prisma.teacherSubject.createMany({
        data: data.teachers.map((tid) => ({
          teacherId: tid,
          subjectId: Number(data.id), 
        })),
        skipDuplicates: true,
      });
    }

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const id = parseInt(data.get("id") as string);
    await prisma.subject.delete({ where: { id } });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};



export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({ data });
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: { id: data.id },
      data,
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const id = parseInt(data.get("id") as string);
    await prisma.class.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};



//
// =========================
// TEACHER CRUD
// =========================
//

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const id = randomUUID();
    const password = await bcrypt.hash(data.password || "", 10);

    await prisma.teacher.create({
      data: {
        id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
      },
    });

    await prisma.userLogin.create({
      data: {
        username: data.username,
        password,
        role: UserRole.TEACHER,
        userType: UserType.TEACHER,
        userId: id,
      },
    });

    if (data.subjects?.length) {
      await prisma.teacherSubject.createMany({
        data: data.subjects.map((s) => ({
          teacherId: id,
          subjectId: parseInt(s),
        })),
        skipDuplicates: true,
      });
    }

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};


export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    if (data.password) {
      const hashed = await bcrypt.hash(data.password, 10);
      await prisma.userLogin.updateMany({
        where: { userId: data.id },
        data: { password: hashed },
      });
    }

    await prisma.userLogin.updateMany({
      where: { userId: data.id },
      data: { username: data.username },
    });

    await prisma.teacher.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
      },
    });

    await prisma.teacherSubject.deleteMany({
      where: { teacherId: data.id },
    });

    if (data.subjects?.length) {
      await prisma.teacherSubject.createMany({
        data: data.subjects.map((sid) => ({
          teacherId: data.id!,
          subjectId: parseInt(sid),
        })),
        skipDuplicates: true,
      });
    }

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};


export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const id = data.get("id") as string;

    await prisma.userLogin.deleteMany({ where: { userId: id } });
    await prisma.teacherSubject.deleteMany({ where: { teacherId: id } });
    await prisma.teacher.delete({ where: { id } });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};



export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity <= classItem._count.students) {
      return { success: false, error: true };
    }

    const id = randomUUID();
    const password = await bcrypt.hash(data.password || "", 10);

    await prisma.student.create({
      data: {
        id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    await prisma.userLogin.create({
      data: {
        username: data.username,
        password,
        role: UserRole.STUDENT,
        userType: UserType.STUDENT,
        userId: id,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};


export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    if (data.password) {
      const hashed = await bcrypt.hash(data.password, 10);
      await prisma.userLogin.updateMany({
        where: { userId: data.id },
        data: { password: hashed },
      });
    }

    await prisma.userLogin.updateMany({
      where: { userId: data.id },
      data: { username: data.username },
    });

    await prisma.student.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};


export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const id = data.get("id") as string;

    await prisma.userLogin.deleteMany({ where: { userId: id } });
    await prisma.student.delete({ where: { id } });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};





export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    const id = parseInt(data.get("id") as string);
    await prisma.exam.delete({ where: { id } });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};
