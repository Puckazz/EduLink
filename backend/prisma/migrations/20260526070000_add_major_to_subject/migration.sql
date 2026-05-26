-- AlterTable: Add major_id column to Subject
ALTER TABLE `Subject`
  ADD COLUMN `major_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Subject_major_id_idx` ON `Subject`(`major_id`);

-- AddForeignKey
ALTER TABLE `Subject`
  ADD CONSTRAINT `Subject_major_id_fkey`
  FOREIGN KEY (`major_id`) REFERENCES `Major`(`major_id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
