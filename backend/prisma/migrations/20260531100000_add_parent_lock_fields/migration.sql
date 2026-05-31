ALTER TABLE `Parent`
  ADD COLUMN `is_locked` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `locked_at` DATETIME(3) NULL;

CREATE INDEX `Parent_is_locked_idx` ON `Parent`(`is_locked`);
