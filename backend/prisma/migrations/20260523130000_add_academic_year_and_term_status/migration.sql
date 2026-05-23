-- CreateTable
CREATE TABLE `AcademicYear` (
    `academic_year_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `status` ENUM('UPCOMING', 'ONGOING', 'FINISHED') NOT NULL DEFAULT 'UPCOMING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AcademicYear_name_key`(`name`),
    INDEX `AcademicYear_status_idx`(`status`),
    INDEX `AcademicYear_start_date_end_date_idx`(`start_date`, `end_date`),
    PRIMARY KEY (`academic_year_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add nullable columns first so existing AcademicTerm rows can be migrated.
ALTER TABLE `AcademicTerm`
  ADD COLUMN `academic_year_id` INTEGER NULL,
  ADD COLUMN `start_date` DATE NULL,
  ADD COLUMN `end_date` DATE NULL,
  ADD COLUMN `status` ENUM('UPCOMING', 'ONGOING', 'FINISHED') NULL;

-- One legacy term year maps to one academic year: 2025 -> 2025 - 2026.
INSERT IGNORE INTO `AcademicYear` (`name`, `start_date`, `end_date`, `status`, `updated_at`)
SELECT
  CONCAT(`year`, ' - ', `year` + 1),
  STR_TO_DATE(CONCAT(`year`, '-09-01'), '%Y-%m-%d'),
  STR_TO_DATE(CONCAT(`year` + 1, '-08-31'), '%Y-%m-%d'),
  'UPCOMING',
  NOW(3)
FROM `AcademicTerm`;

-- Attach terms to their academic years and derive default term dates/status.
UPDATE `AcademicTerm` t
JOIN `AcademicYear` y
  ON y.`name` = CONCAT(t.`year`, ' - ', t.`year` + 1)
SET
  t.`academic_year_id` = y.`academic_year_id`,
  t.`start_date` = CASE
    WHEN t.`code` = 'HK1' THEN STR_TO_DATE(CONCAT(t.`year`, '-09-01'), '%Y-%m-%d')
    WHEN t.`code` = 'HK2' THEN STR_TO_DATE(CONCAT(t.`year` + 1, '-02-01'), '%Y-%m-%d')
    ELSE STR_TO_DATE(CONCAT(t.`year` + 1, '-06-16'), '%Y-%m-%d')
  END,
  t.`end_date` = CASE
    WHEN t.`code` = 'HK1' THEN STR_TO_DATE(CONCAT(t.`year` + 1, '-01-15'), '%Y-%m-%d')
    WHEN t.`code` = 'HK2' THEN STR_TO_DATE(CONCAT(t.`year` + 1, '-06-15'), '%Y-%m-%d')
    ELSE STR_TO_DATE(CONCAT(t.`year` + 1, '-08-31'), '%Y-%m-%d')
  END,
  t.`status` = CASE
    WHEN t.`is_active` = true THEN 'ONGOING'
    WHEN CASE
      WHEN t.`code` = 'HK1' THEN STR_TO_DATE(CONCAT(t.`year` + 1, '-01-15'), '%Y-%m-%d')
      WHEN t.`code` = 'HK2' THEN STR_TO_DATE(CONCAT(t.`year` + 1, '-06-15'), '%Y-%m-%d')
      ELSE STR_TO_DATE(CONCAT(t.`year` + 1, '-08-31'), '%Y-%m-%d')
    END < CURDATE() THEN 'FINISHED'
    ELSE 'UPCOMING'
  END;

-- Keep AcademicYear status aligned with migrated terms.
UPDATE `AcademicYear` y
SET y.`status` = CASE
  WHEN EXISTS (
    SELECT 1 FROM `AcademicTerm` t
    WHERE t.`academic_year_id` = y.`academic_year_id` AND t.`status` = 'ONGOING'
  ) THEN 'ONGOING'
  WHEN NOT EXISTS (
    SELECT 1 FROM `AcademicTerm` t
    WHERE t.`academic_year_id` = y.`academic_year_id` AND t.`status` <> 'FINISHED'
  ) THEN 'FINISHED'
  ELSE 'UPCOMING'
END;

SET @missing_academic_year_data = (
  SELECT COUNT(*) FROM `AcademicTerm`
  WHERE `academic_year_id` IS NULL OR `start_date` IS NULL OR `end_date` IS NULL OR `status` IS NULL
);
SET @missing_academic_year_sql = IF(
  @missing_academic_year_data > 0,
  'SIGNAL SQLSTATE ''45000'' SET MESSAGE_TEXT = ''AcademicYear migration left terms without required calendar data''',
  'SELECT 1'
);
PREPARE missing_academic_year_stmt FROM @missing_academic_year_sql;
EXECUTE missing_academic_year_stmt;
DEALLOCATE PREPARE missing_academic_year_stmt;

-- Replace legacy constraints/columns.
DROP INDEX `AcademicTerm_code_year_key` ON `AcademicTerm`;
DROP INDEX `AcademicTerm_year_idx` ON `AcademicTerm`;
DROP INDEX `AcademicTerm_is_active_idx` ON `AcademicTerm`;

ALTER TABLE `AcademicTerm`
  MODIFY `academic_year_id` INTEGER NOT NULL,
  MODIFY `start_date` DATE NOT NULL,
  MODIFY `end_date` DATE NOT NULL,
  MODIFY `status` ENUM('UPCOMING', 'ONGOING', 'FINISHED') NOT NULL DEFAULT 'UPCOMING';

ALTER TABLE `AcademicTerm`
  DROP COLUMN `year`,
  DROP COLUMN `is_active`;

CREATE UNIQUE INDEX `AcademicTerm_academic_year_id_code_key`
  ON `AcademicTerm`(`academic_year_id`, `code`);
CREATE INDEX `AcademicTerm_academic_year_id_idx` ON `AcademicTerm`(`academic_year_id`);
CREATE INDEX `AcademicTerm_status_idx` ON `AcademicTerm`(`status`);
CREATE INDEX `AcademicTerm_start_date_end_date_idx` ON `AcademicTerm`(`start_date`, `end_date`);

ALTER TABLE `AcademicTerm`
  ADD CONSTRAINT `AcademicTerm_academic_year_id_fkey`
  FOREIGN KEY (`academic_year_id`) REFERENCES `AcademicYear`(`academic_year_id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
