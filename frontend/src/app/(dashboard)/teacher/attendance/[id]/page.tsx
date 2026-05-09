import { TeacherAttendanceDetailPageClient } from '@/components/attendance/detail/TeacherAttendanceDetailPageClient';

export default async function TeacherAttendanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TeacherAttendanceDetailPageClient courseId={id} />;
}

