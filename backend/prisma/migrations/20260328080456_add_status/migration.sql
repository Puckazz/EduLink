-- Drop old status index only when it exists (shadow DB may not have it yet)
SET @student_status_idx_exists := (
	SELECT COUNT(*)
	FROM information_schema.STATISTICS
	WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'Student'
		AND INDEX_NAME = 'Student_status_idx'
);

SET @student_status_idx_drop_sql := IF(
	@student_status_idx_exists > 0,
	'DROP INDEX `Student_status_idx` ON `Student`',
	'SELECT 1'
);

PREPARE student_status_idx_drop_stmt FROM @student_status_idx_drop_sql;
EXECUTE student_status_idx_drop_stmt;
DEALLOCATE PREPARE student_status_idx_drop_stmt;
