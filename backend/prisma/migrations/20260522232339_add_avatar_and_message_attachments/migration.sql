-- Repair-friendly migration: the previous schema had Teacher in Prisma, but no
-- migration created the backing table. These guards also allow rerunning after
-- a partial MySQL DDL failure where Admin/Parent avatar_url may already exist.
SET @add_admin_avatar = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `Admin` ADD COLUMN `avatar_url` VARCHAR(191) NULL',
        'SELECT 1'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Admin'
      AND COLUMN_NAME = 'avatar_url'
);
PREPARE add_admin_avatar_stmt FROM @add_admin_avatar;
EXECUTE add_admin_avatar_stmt;
DEALLOCATE PREPARE add_admin_avatar_stmt;

SET @add_parent_avatar = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `Parent` ADD COLUMN `avatar_url` VARCHAR(191) NULL',
        'SELECT 1'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Parent'
      AND COLUMN_NAME = 'avatar_url'
);
PREPARE add_parent_avatar_stmt FROM @add_parent_avatar;
EXECUTE add_parent_avatar_stmt;
DEALLOCATE PREPARE add_parent_avatar_stmt;

-- CreateTable
CREATE TABLE IF NOT EXISTS `Teacher` (
    `teacher_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `refresh_token_hash` VARCHAR(191) NULL,
    `full_name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `avatar_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Teacher_username_key`(`username`),
    UNIQUE INDEX `Teacher_email_key`(`email`),
    UNIQUE INDEX `Teacher_phone_key`(`phone`),
    PRIMARY KEY (`teacher_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @add_teacher_avatar = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `Teacher` ADD COLUMN `avatar_url` VARCHAR(191) NULL',
        'SELECT 1'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Teacher'
      AND COLUMN_NAME = 'avatar_url'
);
PREPARE add_teacher_avatar_stmt FROM @add_teacher_avatar;
EXECUTE add_teacher_avatar_stmt;
DEALLOCATE PREPARE add_teacher_avatar_stmt;

SET @add_class_section_teacher_id = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `ClassSection` ADD COLUMN `teacher_id` INTEGER NULL',
        'SELECT 1'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ClassSection'
      AND COLUMN_NAME = 'teacher_id'
);
PREPARE add_class_section_teacher_id_stmt FROM @add_class_section_teacher_id;
EXECUTE add_class_section_teacher_id_stmt;
DEALLOCATE PREPARE add_class_section_teacher_id_stmt;

SET @add_class_section_teacher_fk = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `ClassSection` ADD CONSTRAINT `ClassSection_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `Teacher`(`teacher_id`) ON DELETE SET NULL ON UPDATE CASCADE',
        'SELECT 1'
    )
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND CONSTRAINT_NAME = 'ClassSection_teacher_id_fkey'
);
PREPARE add_class_section_teacher_fk_stmt FROM @add_class_section_teacher_fk;
EXECUTE add_class_section_teacher_fk_stmt;
DEALLOCATE PREPARE add_class_section_teacher_fk_stmt;

-- CreateTable
CREATE TABLE IF NOT EXISTS `MessageAttachment` (
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
SET @add_message_attachment_fk = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `MessageAttachment` ADD CONSTRAINT `MessageAttachment_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `FeedbackMessage`(`message_id`) ON DELETE CASCADE ON UPDATE CASCADE',
        'SELECT 1'
    )
    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND CONSTRAINT_NAME = 'MessageAttachment_message_id_fkey'
);
PREPARE add_message_attachment_fk_stmt FROM @add_message_attachment_fk;
EXECUTE add_message_attachment_fk_stmt;
DEALLOCATE PREPARE add_message_attachment_fk_stmt;
