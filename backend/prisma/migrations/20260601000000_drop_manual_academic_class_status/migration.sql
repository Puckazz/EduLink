-- Drop manual status columns. Status is now computed from academic dates.
DROP INDEX `AcademicYear_status_idx` ON `AcademicYear`;
ALTER TABLE `AcademicYear` DROP COLUMN `status`;

DROP INDEX `AcademicTerm_status_idx` ON `AcademicTerm`;
ALTER TABLE `AcademicTerm` DROP COLUMN `status`;

DROP INDEX `ClassSection_term_id_status_idx` ON `ClassSection`;
ALTER TABLE `ClassSection` DROP COLUMN `status`;
