-- Add relationship classification for parent accounts.
ALTER TABLE `Parent`
ADD COLUMN `relationship` ENUM('CHA', 'ME', 'NGUOI_GIAM_HO') NOT NULL DEFAULT 'NGUOI_GIAM_HO';
