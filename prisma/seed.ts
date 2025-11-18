import { Day, PrismaClient, UserSex, UserRole, UserType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  // ======================
  // ADMIN
  // ======================
  await prisma.admin.createMany({
    data: [
      {
        id: "admin1",
        username: "admin1"
      },
      {
        id: "admin2",
        username: "admin2"
      },
    ],
  });

  // ======================
  // GRADE
  // ======================
  for (let i = 1; i <= 6; i++) {
    await prisma.grade.create({ data: { level: i } });
  }

  // ======================
  // CLASS
  // ======================
  for (let i = 1; i <= 6; i++) {
    await prisma.class.create({
      data: {
        name: `${i}A`,
        gradeId: i,
        capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
      },
    });
  }

  // ======================
  // SUBJECT
  // ======================
  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Geography",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Art",
  ];
  for (const name of subjects) {
    await prisma.subject.create({ data: { name } });
  }

  // ======================
  // TEACHER
  // ======================
  for (let i = 1; i <= 15; i++) {
    await prisma.teacher.create({
      data: {
        id: `teacher${i}`,
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
      },
    });
  }

  // LINK TEACHERS TO SUBJECTS AND CLASSES
  for (let i = 1; i <= 15; i++) {
    await prisma.teacherSubject.create({
      data: {
        teacherId: `teacher${i}`,
        subjectId: ((i - 1) % 10) + 1,
      },
    });

    await prisma.class.update({
      where: { id: ((i - 1) % 6) + 1 },
      data: { supervisorId: `teacher${i}` },
    });
  }

  // ======================
  // LESSONS
  // ======================
  for (let i = 1; i <= 30; i++) {
    await prisma.lesson.create({
      data: {
        name: `Lesson${i}`,
        day: Day[
          Object.keys(Day)[
            Math.floor(Math.random() * Object.keys(Day).length)
          ] as keyof typeof Day
        ],
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 3)),
        subjectId: (i % 10) + 1,
        classId: (i % 6) + 1,
        teacherId: `teacher${(i % 15) + 1}`,
      },
    });
  }

  // ======================
  // PARENTS
  // ======================
  for (let i = 1; i <= 25; i++) {
    await prisma.parent.create({
      data: {
        id: `parentId${i}`,
        username: `parentId${i}`,
        name: `PName${i}`,
        surname: `PSurname${i}`,
        email: `parent${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
      },
    });
  }

  // ======================
  // STUDENT
  // ======================
  for (let i = 1; i <= 50; i++) {
    await prisma.student.create({
      data: {
        id: `student${i}`,
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname${i}`,
        email: `student${i}@example.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        parentId: `parentId${Math.ceil(i / 2) % 25 || 25}`,
        gradeId: (i % 6) + 1,
        classId: (i % 6) + 1,
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
      },
    });
  }

  // ======================
  // EXAM
  // ======================
  for (let i = 1; i <= 10; i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime: new Date(),
        endTime: new Date(),
        lessonId: (i % 30) + 1,
      },
    });
  }

  // ======================
  // ASSIGNMENT
  // ======================
  for (let i = 1; i <= 10; i++) {
    await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startDate: new Date(),
        dueDate: new Date(),
        lessonId: (i % 30) + 1,
      },
    });
  }

  // ======================
  // RESULTS
  // ======================
  for (let i = 1; i <= 10; i++) {
    await prisma.result.create({
      data: {
        score: 90,
        studentId: `student${i}`,
        ...(i <= 5 ? { examId: i } : { assignmentId: i - 5 }),
      },
    });
  }

  // ======================
  // ATTENDANCE
  // ======================
  for (let i = 1; i <= 10; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(),
        present: true,
        studentId: `student${i}`,
        lessonId: (i % 30) + 1,
      },
    });
  }

  // ======================
  // EVENT
  // ======================
  for (let i = 1; i <= 5; i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        startTime: new Date(),
        endTime: new Date(),
        classId: (i % 5) + 1,
      },
    });
  }

  // ======================
  // ANNOUNCEMENT
  // ======================
  for (let i = 1; i <= 5; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Description for Announcement ${i}`,
        date: new Date(),
        classId: (i % 5) + 1,
      },
    });
  }

  // =========================================================
  // USER LOGIN CREATION (ADMIN + TEACHERS + STUDENTS)
  // =========================================================

  console.log("Creating login accounts...");

  // --- Admin Login ---
  await prisma.userLogin.createMany({
    data: [
      {
        username: "admin1",
        password: await bcrypt.hash("admin@1", 10),
        role: UserRole.ADMIN,
        userType: UserType.ADMIN,
        userId: "admin1",
      },
      {
        username: "admin2",
        password: await bcrypt.hash("admin@2", 10),
        role: UserRole.ADMIN,
        userType: UserType.ADMIN,
        userId: "admin2",
      },
    ],
  });

  // --- Teacher Login ---
  for (let i = 1; i <= 15; i++) {
    await prisma.userLogin.create({
      data: {
        username: `teacher${i}`,
        password: await bcrypt.hash("teacher123", 10),
        role: UserRole.TEACHER,
        userType: UserType.TEACHER,
        userId: `teacher${i}`,
      },
    });
  }

  // --- Student Login ---
  for (let i = 1; i <= 50; i++) {
    await prisma.userLogin.create({
      data: {
        username: `student${i}`,
        password: await bcrypt.hash("student123", 10),
        role: UserRole.STUDENT,
        userType: UserType.STUDENT,
        userId: `student${i}`,
      },
    });
  }


  console.log("Login accounts created.");
  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
