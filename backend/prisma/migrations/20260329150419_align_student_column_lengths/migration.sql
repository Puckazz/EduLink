-- DropIndex
DROP INDEX `Student_status_idx` ON `Student`;

-- AlterTable
ALTER TABLE `Student` MODIFY `email` VARCHAR(191) NULL,
    MODIFY `cohort` VARCHAR(191) NULL;
