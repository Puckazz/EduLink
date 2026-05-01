import { AttendanceDetailPageClient } from '@/components/attendance/detail/AttendanceDetailPageClient';

export default async function TeacherAttendanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return <AttendanceDetailPageClient courseId={id} />;
}
