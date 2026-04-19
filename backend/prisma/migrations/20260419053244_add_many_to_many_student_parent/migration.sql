/*
  Warnings:

  - You are about to drop the column `parent_id` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Student` DROP FOREIGN KEY `Student_parent_id_fkey`;

-- AlterTable
ALTER TABLE `Score` ALTER COLUMN `updated_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Student` DROP COLUMN `parent_id`;

-- CreateTable
CREATE TABLE `StudentParent` (
    `student_id` INTEGER NOT NULL,
    `parent_id` INTEGER NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `StudentParent_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`student_id`, `parent_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentParent` ADD CONSTRAINT `StudentParent_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `Student`(`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentParent` ADD CONSTRAINT `StudentParent_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Parent`(`parent_id`) ON DELETE CASCADE ON UPDATE CASCADE;
