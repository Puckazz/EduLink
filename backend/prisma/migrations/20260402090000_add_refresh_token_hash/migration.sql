-- AlterTable
ALTER TABLE `Admin`
    ADD COLUMN `refresh_token_hash` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Parent`
    ADD COLUMN `refresh_token_hash` VARCHAR(255) NULL;
