/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.
  - Made the column `full_name` on table `Parent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Parent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Parent` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `username` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL,
    MODIFY `full_name` VARCHAR(191) NOT NULL,
    MODIFY `phone` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(191) NOT NULL,
    `otp_code` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `is_used` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Otp_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Parent_phone_key` ON `Parent`(`phone`);

-- CreateIndex
CREATE UNIQUE INDEX `Parent_email_key` ON `Parent`(`email`);
