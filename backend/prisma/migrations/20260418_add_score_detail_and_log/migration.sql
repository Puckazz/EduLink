-- Modify Score table: drop score_value, add new grading fields
ALTER TABLE `Score`
  DROP COLUMN `score_value`,
  ADD COLUMN `assignment` DOUBLE NULL,
  ADD COLUMN `midterm` DOUBLE NULL,
  ADD COLUMN `final` DOUBLE NULL,
  ADD COLUMN `avg` DOUBLE NULL,
  ADD COLUMN `note` TEXT NULL,
  ADD COLUMN `publish_status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

-- Create ScoreLog table for audit trail
CREATE TABLE `ScoreLog` (
  `log_id` INTEGER NOT NULL AUTO_INCREMENT,
  `actor` VARCHAR(191) NOT NULL,
  `action` VARCHAR(191) NOT NULL,
  `student_code` VARCHAR(191) NULL,
  `student_name` VARCHAR(191) NULL,
  `description` TEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
