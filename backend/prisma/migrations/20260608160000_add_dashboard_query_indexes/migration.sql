CREATE INDEX `Score_student_id_publish_status_created_at_idx`
  ON `Score`(`student_id`, `publish_status`, `created_at`);

CREATE INDEX `Attendance_student_id_created_at_idx`
  ON `Attendance`(`student_id`, `created_at`);

CREATE INDEX `Notification_target_role_target_id_created_at_idx`
  ON `Notification`(`target_role`, `target_id`, `created_at`);
