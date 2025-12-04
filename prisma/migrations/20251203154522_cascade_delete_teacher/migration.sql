-- DropForeignKey
ALTER TABLE `Lesson` DROP FOREIGN KEY `Lesson_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `TeacherSubject` DROP FOREIGN KEY `TeacherSubject_teacherId_fkey`;

-- DropIndex
DROP INDEX `Lesson_teacherId_fkey` ON `Lesson`;

-- AddForeignKey
ALTER TABLE `TeacherSubject` ADD CONSTRAINT `TeacherSubject_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
