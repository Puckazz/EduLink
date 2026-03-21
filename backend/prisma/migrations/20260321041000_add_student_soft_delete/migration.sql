-- Add soft-delete column for students
ALTER TABLE `Student`
  ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- Optional index to speed up active-student queries
CREATE INDEX `Student_deleted_at_idx` ON `Student`(`deleted_at`);
