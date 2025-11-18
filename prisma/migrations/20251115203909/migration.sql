-- AlterTable
ALTER TABLE `Admin` MODIFY `password` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `UserLogin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `userType` ENUM('TEACHER', 'STUDENT', 'PARENT') NOT NULL,
    `token` VARCHAR(191) NULL,

    UNIQUE INDEX `UserLogin_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
