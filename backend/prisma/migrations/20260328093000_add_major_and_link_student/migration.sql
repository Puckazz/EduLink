-- Create major table
CREATE TABLE `Major` (
  `major_id` INT NOT NULL AUTO_INCREMENT,
  `major_code` VARCHAR(191) NOT NULL,
  `major_name` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `Major_major_code_key`(`major_code`),
  PRIMARY KEY (`major_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add major relation to student
ALTER TABLE `Student`
  ADD COLUMN `major_id` INT NULL;

CREATE INDEX `Student_major_id_idx` ON `Student`(`major_id`);

ALTER TABLE `Student`
  ADD CONSTRAINT `Student_major_id_fkey`
  FOREIGN KEY (`major_id`) REFERENCES `Major`(`major_id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
