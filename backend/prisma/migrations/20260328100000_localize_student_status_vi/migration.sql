-- Localize student status values to Vietnamese with accents
-- Step 0: ensure status column exists (for clean shadow database replay)
SET @student_status_col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Student'
    AND COLUMN_NAME = 'status'
);

SET @student_status_add_sql := IF(
  @student_status_col_exists = 0,
  "ALTER TABLE `Student` ADD COLUMN `status` ENUM('dang hoc', 'bao luu', 'dinh chi') NOT NULL DEFAULT 'dang hoc'",
  'SELECT 1'
);

PREPARE student_status_stmt FROM @student_status_add_sql;
EXECUTE student_status_stmt;
DEALLOCATE PREPARE student_status_stmt;

-- Step 1: create temporary localized status column
ALTER TABLE `Student`
  ADD COLUMN `status_vi` ENUM('Đang học', 'Bảo lưu', 'Đình chỉ') NOT NULL DEFAULT 'Đang học';

-- Step 2: map old/new values into localized status column
UPDATE `Student`
SET `status_vi` = CASE
  WHEN `status` = 'bao luu' THEN 'Bảo lưu'
  WHEN `status` = 'dinh chi' THEN 'Đình chỉ'
  WHEN `status` = 'Bảo lưu' THEN 'Bảo lưu'
  WHEN `status` = 'Đình chỉ' THEN 'Đình chỉ'
  ELSE 'Đang học'
END;

-- Step 3: replace old status column with localized one
ALTER TABLE `Student` DROP COLUMN `status`;

ALTER TABLE `Student`
  CHANGE COLUMN `status_vi` `status` ENUM('Đang học', 'Bảo lưu', 'Đình chỉ') NOT NULL DEFAULT 'Đang học';

SET @student_status_idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Student'
    AND INDEX_NAME = 'Student_status_idx'
);

SET @student_status_idx_sql := IF(
  @student_status_idx_exists = 0,
  'CREATE INDEX `Student_status_idx` ON `Student`(`status`)',
  'SELECT 1'
);

PREPARE student_status_idx_stmt FROM @student_status_idx_sql;
EXECUTE student_status_idx_stmt;
DEALLOCATE PREPARE student_status_idx_stmt;
