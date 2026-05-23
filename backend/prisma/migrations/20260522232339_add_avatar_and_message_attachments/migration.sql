-- AlterTable
ALTER TABLE `Admin` ADD COLUMN `avatar_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Parent` ADD COLUMN `avatar_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Teacher` ADD COLUMN `avatar_url` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `MessageAttachment` (
    `attachment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `public_id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_type` VARCHAR(191) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `is_image` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `message_id` INTEGER NOT NULL,

    INDEX `MessageAttachment_message_id_idx`(`message_id`),
    PRIMARY KEY (`attachment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MessageAttachment` ADD CONSTRAINT `MessageAttachment_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `FeedbackMessage`(`message_id`) ON DELETE CASCADE ON UPDATE CASCADE;
