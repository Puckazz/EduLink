ALTER TABLE `Teacher`
  ADD COLUMN `is_locked` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `locked_at` DATETIME(3) NULL;

CREATE INDEX `Teacher_is_locked_idx` ON `Teacher`(`is_locked`);
