-- DropForeignKey
ALTER TABLE `Assignment` DROP FOREIGN KEY `Assignment_lessonId_fkey`;

-- DropForeignKey
ALTER TABLE `Attendance` DROP FOREIGN KEY `Attendance_lessonId_fkey`;

-- DropForeignKey
ALTER TABLE `Exam` DROP FOREIGN KEY `Exam_lessonId_fkey`;

-- DropForeignKey
ALTER TABLE `Result` DROP FOREIGN KEY `Result_assignmentId_fkey`;

-- DropForeignKey
ALTER TABLE `Result` DROP FOREIGN KEY `Result_examId_fkey`;

-- DropIndex
DROP INDEX `Assignment_lessonId_fkey` ON `Assignment`;

-- DropIndex
DROP INDEX `Attendance_lessonId_fkey` ON `Attendance`;

-- DropIndex
DROP INDEX `Exam_lessonId_fkey` ON `Exam`;

-- DropIndex
DROP INDEX `Result_assignmentId_fkey` ON `Result`;

-- DropIndex
DROP INDEX `Result_examId_fkey` ON `Result`;

-- AddForeignKey
ALTER TABLE `Exam` ADD CONSTRAINT `Exam_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `Assignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
