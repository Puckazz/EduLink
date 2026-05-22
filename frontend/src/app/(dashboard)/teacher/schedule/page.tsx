import { TeacherSchedulePageClient } from '@/components/teacher/schedule/TeacherSchedulePageClient';

export const metadata = {
  title: 'Thời khóa biểu giảng viên | EduLink',
  description: 'Xem lịch dạy và lớp học phần của giảng viên',
};

export default function TeacherSchedulePage() {
  return <TeacherSchedulePageClient />;
}
