-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `feedback_id` INTEGER NULL,
    ADD COLUMN `target_id` INTEGER NULL,
    ADD COLUMN `target_role` VARCHAR(191) NULL,
    MODIFY `content` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `Faq` (
    `faq_id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` TEXT NOT NULL,
    `answer` TEXT NOT NULL,
    `category` ENUM('HOC_TAP', 'TAI_CHINH', 'THOI_KHOA_BIEU', 'KY_LUAT', 'KY_TUC_XA', 'SUC_KHOE', 'HOAT_DONG', 'KHAC') NOT NULL DEFAULT 'KHAC',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Faq_category_idx`(`category`),
    INDEX `Faq_is_active_idx`(`is_active`),
    PRIMARY KEY (`faq_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPreference` (
    `pref_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `UserPreference_role_user_id_idx`(`role`, `user_id`),
    UNIQUE INDEX `UserPreference_role_user_id_key_key`(`role`, `user_id`, `key`),
    PRIMARY KEY (`pref_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatConversation` (
    `conversation_id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(150) NOT NULL,
    `parent_id` INTEGER NOT NULL,
    `student_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChatConversation_parent_id_created_at_idx`(`parent_id`, `created_at`),
    INDEX `ChatConversation_student_id_idx`(`student_id`),
    PRIMARY KEY (`conversation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatHistory` (
    `chat_id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` INTEGER NOT NULL,
    `role` ENUM('USER', 'ASSISTANT') NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChatHistory_conversation_id_created_at_idx`(`conversation_id`, `created_at`),
    PRIMARY KEY (`chat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Notification_target_role_target_id_idx` ON `Notification`(`target_role`, `target_id`);

-- AddForeignKey
ALTER TABLE `ChatConversation` ADD CONSTRAINT `ChatConversation_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Parent`(`parent_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatConversation` ADD CONSTRAINT `ChatConversation_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `Student`(`student_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatHistory` ADD CONSTRAINT `ChatHistory_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `ChatConversation`(`conversation_id`) ON DELETE CASCADE ON UPDATE CASCADE;
