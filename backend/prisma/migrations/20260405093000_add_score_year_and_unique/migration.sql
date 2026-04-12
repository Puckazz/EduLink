-- AlterTable
ALTER TABLE `Score`
  ADD COLUMN `year` INT NOT NULL DEFAULT 2025;

-- CreateIndex
CREATE UNIQUE INDEX `Score_student_id_subject_id_semester_year_key`
  ON `Score`(`student_id`, `subject_id`, `semester`, `year`);

-- CreateIndex
CREATE INDEX `Score_student_id_semester_year_idx`
  ON `Score`(`student_id`, `semester`, `year`);
