/*
  Warnings:

  - Added the required column `title` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: step 1 — add columns WITH defaults so existing rows are filled
ALTER TABLE `Feedback`
    ADD COLUMN `category` ENUM('HOC_TAP', 'TAI_CHINH', 'THOI_KHOA_BIEU', 'KY_LUAT', 'KY_TUC_XA', 'SUC_KHOE', 'HOAT_DONG', 'KHAC') NOT NULL DEFAULT 'KHAC',
    ADD COLUMN `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    ADD COLUMN `student_id` INTEGER NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL DEFAULT 'Phản hồi',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `content` TEXT NOT NULL;

-- AlterTable: step 2 — remove the temporary defaults from title & updated_at
ALTER TABLE `Feedback`
    ALTER COLUMN `title` DROP DEFAULT,
    ALTER COLUMN `updated_at` DROP DEFAULT;


-- CreateTable
CREATE TABLE `FeedbackMessage` (
    `message_id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `sender_role` ENUM('PARENT', 'ADMIN') NOT NULL,
    `sender_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `feedback_id` INTEGER NOT NULL,

    INDEX `FeedbackMessage_feedback_id_idx`(`feedback_id`),
    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Feedback_status_idx` ON `Feedback`(`status`);

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `Student`(`student_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedbackMessage` ADD CONSTRAINT `FeedbackMessage_feedback_id_fkey` FOREIGN KEY (`feedback_id`) REFERENCES `Feedback`(`feedback_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Feedback` RENAME INDEX `Feedback_parent_id_fkey` TO `Feedback_parent_id_idx`;
