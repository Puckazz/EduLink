-- CreateTable
CREATE TABLE `ClassSection` (
    `section_id` INTEGER NOT NULL AUTO_INCREMENT,
    `class_code` VARCHAR(191) NOT NULL,
    `teacher_name` VARCHAR(191) NOT NULL,
    `day_of_week` VARCHAR(191) NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `room` VARCHAR(191) NOT NULL,
    `semester` VARCHAR(191) NOT NULL,
    `status` ENUM('UPCOMING', 'ONGOING', 'FINISHED') NOT NULL DEFAULT 'UPCOMING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `subject_id` INTEGER NOT NULL,

    UNIQUE INDEX `ClassSection_class_code_key`(`class_code`),
    INDEX `ClassSection_semester_idx`(`semester`),
    INDEX `ClassSection_subject_id_idx`(`subject_id`),
    PRIMARY KEY (`section_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassEnrollment` (
    `enrollment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `enrolled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `section_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,

    INDEX `ClassEnrollment_student_id_idx`(`student_id`),
    UNIQUE INDEX `ClassEnrollment_section_id_student_id_key`(`section_id`, `student_id`),
    PRIMARY KEY (`enrollment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendanceSession` (
    `session_id` INTEGER NOT NULL AUTO_INCREMENT,
    `session_date` DATE NOT NULL,
    `session_no` INTEGER NOT NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `section_id` INTEGER NOT NULL,

    INDEX `AttendanceSession_section_id_idx`(`section_id`),
    UNIQUE INDEX `AttendanceSession_section_id_session_no_key`(`section_id`, `session_no`),
    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendanceRecord` (
    `record_id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('NONE', 'PRESENT', 'LATE', 'ABSENT') NOT NULL DEFAULT 'NONE',
    `note` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `session_id` INTEGER NOT NULL,
    `enrollment_id` INTEGER NOT NULL,

    INDEX `AttendanceRecord_enrollment_id_idx`(`enrollment_id`),
    UNIQUE INDEX `AttendanceRecord_session_id_enrollment_id_key`(`session_id`, `enrollment_id`),
    PRIMARY KEY (`record_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClassSection` ADD CONSTRAINT `ClassSection_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `Subject`(`subject_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassEnrollment` ADD CONSTRAINT `ClassEnrollment_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `ClassSection`(`section_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassEnrollment` ADD CONSTRAINT `ClassEnrollment_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `Student`(`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceSession` ADD CONSTRAINT `AttendanceSession_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `ClassSection`(`section_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceRecord` ADD CONSTRAINT `AttendanceRecord_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `AttendanceSession`(`session_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceRecord` ADD CONSTRAINT `AttendanceRecord_enrollment_id_fkey` FOREIGN KEY (`enrollment_id`) REFERENCES `ClassEnrollment`(`enrollment_id`) ON DELETE CASCADE ON UPDATE CASCADE;
