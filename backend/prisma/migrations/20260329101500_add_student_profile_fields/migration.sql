-- AlterTable
ALTER TABLE `Student`
  ADD COLUMN `email` VARCHAR(100) NULL,
  ADD COLUMN `study_year` INTEGER NULL,
  ADD COLUMN `cohort` VARCHAR(50) NULL;
