-- CreateTable
CREATE TABLE `AcademicTerm` (
    `term_id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` ENUM('HK1', 'HK2', 'HKH') NOT NULL,
    `year` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AcademicTerm_code_year_key`(`code`, `year`),
    INDEX `AcademicTerm_year_idx`(`year`),
    INDEX `AcademicTerm_is_active_idx`(`is_active`),
    PRIMARY KEY (`term_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add nullable term references before data migration.
ALTER TABLE `Score` ADD COLUMN `term_id` INTEGER NULL;
ALTER TABLE `Attendance` ADD COLUMN `term_id` INTEGER NULL;
ALTER TABLE `ClassSection` ADD COLUMN `term_id` INTEGER NULL;

-- Fail early when old semester strings cannot be parsed safely.
SET @bad_score = (
  SELECT COUNT(*) FROM `Score`
  WHERE `semester` NOT REGEXP '^HK(1|2|H)'
);
SET @bad_attendance = (
  SELECT COUNT(*) FROM `Attendance`
  WHERE `semester` NOT REGEXP '^HK(1|2|H)(-|/)[0-9]{4}$'
);
SET @bad_class_section = (
  SELECT COUNT(*) FROM `ClassSection`
  WHERE `semester` NOT REGEXP '^HK(1|2|H)(-|/)[0-9]{4}$'
);
SET @bad_total = @bad_score + @bad_attendance + @bad_class_section;
SET @fail_sql = IF(
  @bad_total > 0,
  'SIGNAL SQLSTATE ''45000'' SET MESSAGE_TEXT = ''Cannot parse legacy semester values for AcademicTerm migration''',
  'SELECT 1'
);
PREPARE fail_stmt FROM @fail_sql;
EXECUTE fail_stmt;
DEALLOCATE PREPARE fail_stmt;

-- Create all terms referenced by legacy data.
INSERT IGNORE INTO `AcademicTerm` (`code`, `year`, `name`, `is_active`, `updated_at`)
SELECT
  CASE
    WHEN `semester` LIKE 'HK1%' THEN 'HK1'
    WHEN `semester` LIKE 'HK2%' THEN 'HK2'
    ELSE 'HKH'
  END AS `code`,
  `year`,
  CONCAT(
    CASE
      WHEN `semester` LIKE 'HK1%' THEN 'Học kỳ I'
      WHEN `semester` LIKE 'HK2%' THEN 'Học kỳ II'
      ELSE 'Học kỳ hè'
    END,
    ' - ',
    `year`
  ) AS `name`,
  false,
  NOW(3)
FROM `Score`;

INSERT IGNORE INTO `AcademicTerm` (`code`, `year`, `name`, `is_active`, `updated_at`)
SELECT
  CASE
    WHEN `semester` LIKE 'HK1%' THEN 'HK1'
    WHEN `semester` LIKE 'HK2%' THEN 'HK2'
    ELSE 'HKH'
  END AS `code`,
  CAST(CASE
    WHEN `semester` LIKE '%-%' THEN SUBSTRING_INDEX(`semester`, '-', -1)
    ELSE SUBSTRING_INDEX(`semester`, '/', -1)
  END AS UNSIGNED) AS `year`,
  CONCAT(
    CASE
      WHEN `semester` LIKE 'HK1%' THEN 'Học kỳ I'
      WHEN `semester` LIKE 'HK2%' THEN 'Học kỳ II'
      ELSE 'Học kỳ hè'
    END,
    ' - ',
    CAST(CASE
      WHEN `semester` LIKE '%-%' THEN SUBSTRING_INDEX(`semester`, '-', -1)
      ELSE SUBSTRING_INDEX(`semester`, '/', -1)
    END AS UNSIGNED)
  ) AS `name`,
  false,
  NOW(3)
FROM `Attendance`;

INSERT IGNORE INTO `AcademicTerm` (`code`, `year`, `name`, `is_active`, `updated_at`)
SELECT
  CASE
    WHEN `semester` LIKE 'HK1%' THEN 'HK1'
    WHEN `semester` LIKE 'HK2%' THEN 'HK2'
    ELSE 'HKH'
  END AS `code`,
  CAST(CASE
    WHEN `semester` LIKE '%-%' THEN SUBSTRING_INDEX(`semester`, '-', -1)
    ELSE SUBSTRING_INDEX(`semester`, '/', -1)
  END AS UNSIGNED) AS `year`,
  CONCAT(
    CASE
      WHEN `semester` LIKE 'HK1%' THEN 'Học kỳ I'
      WHEN `semester` LIKE 'HK2%' THEN 'Học kỳ II'
      ELSE 'Học kỳ hè'
    END,
    ' - ',
    CAST(CASE
      WHEN `semester` LIKE '%-%' THEN SUBSTRING_INDEX(`semester`, '-', -1)
      ELSE SUBSTRING_INDEX(`semester`, '/', -1)
    END AS UNSIGNED)
  ) AS `name`,
  false,
  NOW(3)
FROM `ClassSection`;

-- Mark the latest referenced term as active when no term is active yet.
UPDATE `AcademicTerm`
SET `is_active` = true
WHERE `term_id` = (
  SELECT `term_id` FROM (
    SELECT `term_id`
    FROM `AcademicTerm`
    ORDER BY `year` DESC, FIELD(`code`, 'HKH', 'HK2', 'HK1') DESC
    LIMIT 1
  ) AS latest_term
);

-- Attach legacy rows to their terms.
UPDATE `Score` s
JOIN `AcademicTerm` t
  ON t.`code` = CASE
    WHEN s.`semester` LIKE 'HK1%' THEN 'HK1'
    WHEN s.`semester` LIKE 'HK2%' THEN 'HK2'
    ELSE 'HKH'
  END
  AND t.`year` = s.`year`
SET s.`term_id` = t.`term_id`;

UPDATE `Attendance` a
JOIN `AcademicTerm` t
  ON t.`code` = CASE
    WHEN a.`semester` LIKE 'HK1%' THEN 'HK1'
    WHEN a.`semester` LIKE 'HK2%' THEN 'HK2'
    ELSE 'HKH'
  END
  AND t.`year` = CAST(CASE
    WHEN a.`semester` LIKE '%-%' THEN SUBSTRING_INDEX(a.`semester`, '-', -1)
    ELSE SUBSTRING_INDEX(a.`semester`, '/', -1)
  END AS UNSIGNED)
SET a.`term_id` = t.`term_id`;

UPDATE `ClassSection` c
JOIN `AcademicTerm` t
  ON t.`code` = CASE
    WHEN c.`semester` LIKE 'HK1%' THEN 'HK1'
    WHEN c.`semester` LIKE 'HK2%' THEN 'HK2'
    ELSE 'HKH'
  END
  AND t.`year` = CAST(CASE
    WHEN c.`semester` LIKE '%-%' THEN SUBSTRING_INDEX(c.`semester`, '-', -1)
    ELSE SUBSTRING_INDEX(c.`semester`, '/', -1)
  END AS UNSIGNED)
SET c.`term_id` = t.`term_id`;

SET @missing_terms = (
  SELECT
    (SELECT COUNT(*) FROM `Score` WHERE `term_id` IS NULL) +
    (SELECT COUNT(*) FROM `Attendance` WHERE `term_id` IS NULL) +
    (SELECT COUNT(*) FROM `ClassSection` WHERE `term_id` IS NULL)
);
SET @missing_sql = IF(
  @missing_terms > 0,
  'SIGNAL SQLSTATE ''45000'' SET MESSAGE_TEXT = ''AcademicTerm migration left rows without term_id''',
  'SELECT 1'
);
PREPARE missing_stmt FROM @missing_sql;
EXECUTE missing_stmt;
DEALLOCATE PREPARE missing_stmt;

-- Replace legacy indexes and columns.
DROP INDEX `Score_student_id_subject_id_semester_year_key` ON `Score`;
CREATE INDEX `Score_student_id_term_id_idx` ON `Score`(`student_id`, `term_id`);
DROP INDEX `Score_student_id_semester_year_idx` ON `Score`;
DROP INDEX `ClassSection_semester_idx` ON `ClassSection`;

ALTER TABLE `Score` MODIFY `term_id` INTEGER NOT NULL;
ALTER TABLE `Attendance` MODIFY `term_id` INTEGER NOT NULL;
ALTER TABLE `ClassSection` MODIFY `term_id` INTEGER NOT NULL;

ALTER TABLE `Score` DROP COLUMN `semester`, DROP COLUMN `year`;
ALTER TABLE `Attendance` DROP COLUMN `semester`;
ALTER TABLE `ClassSection` DROP COLUMN `semester`;

CREATE UNIQUE INDEX `Score_student_id_subject_id_term_id_key`
  ON `Score`(`student_id`, `subject_id`, `term_id`);
CREATE INDEX `Score_term_id_idx` ON `Score`(`term_id`);
CREATE UNIQUE INDEX `Attendance_student_id_term_id_key`
  ON `Attendance`(`student_id`, `term_id`);
CREATE INDEX `Attendance_term_id_idx` ON `Attendance`(`term_id`);
CREATE INDEX `ClassSection_term_id_idx` ON `ClassSection`(`term_id`);

ALTER TABLE `Score`
  ADD CONSTRAINT `Score_term_id_fkey`
  FOREIGN KEY (`term_id`) REFERENCES `AcademicTerm`(`term_id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Attendance`
  ADD CONSTRAINT `Attendance_term_id_fkey`
  FOREIGN KEY (`term_id`) REFERENCES `AcademicTerm`(`term_id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `ClassSection`
  ADD CONSTRAINT `ClassSection_term_id_fkey`
  FOREIGN KEY (`term_id`) REFERENCES `AcademicTerm`(`term_id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
