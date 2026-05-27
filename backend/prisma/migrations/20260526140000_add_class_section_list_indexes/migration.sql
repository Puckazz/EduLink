CREATE INDEX `ClassSection_teacher_id_idx` ON `ClassSection`(`teacher_id`);

CREATE INDEX `ClassSection_term_id_status_idx` ON `ClassSection`(`term_id`, `status`);

CREATE INDEX `ClassSection_created_at_idx` ON `ClassSection`(`created_at`);
