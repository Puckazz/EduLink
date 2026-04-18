import { StudentDetailPageClient } from '@/components/students/detail/StudentDetailPageClient';

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StudentDetailPageClient studentId={Number(id)} />;
}
