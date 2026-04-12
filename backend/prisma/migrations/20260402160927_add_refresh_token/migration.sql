/*
  Warnings:

  - You are about to alter the column `refresh_token_hash` on the `Admin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `refresh_token_hash` on the `Parent` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Admin` MODIFY `refresh_token_hash` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Parent` MODIFY `refresh_token_hash` VARCHAR(191) NULL;
