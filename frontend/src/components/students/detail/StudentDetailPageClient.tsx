'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StudentDetailHeader } from './StudentDetailHeader';
import { StudentSummaryCards } from './StudentSummaryCards';
import { StudentProfileCard } from './StudentProfileCard';
import { StudentParentsCard } from './StudentParentsCard';
import { StudentRecentScoresCard } from './StudentRecentScoresCard';
import { StudentAttendanceCalendar } from './StudentAttendanceCalendar';
import { StudentDetailSkeleton } from './StudentDetailSkeleton';
import { StudentEditModal } from '@/components/students/StudentEditModal';
import { useStudentEditModalStore } from '@/components/students/stores/useStudentEditModalStore';
import {
  useStudentDetail,
  getApiErrorMessage,
} from '@/components/students/hooks/useStudentDetail';
import {
  calculateTotalCredits,
  calculateWeightedAverageScore,
  summarizeAttendance,
} from '@/components/students/mappers/student-detail.mapper';

interface StudentDetailPageClientProps {
  studentId: number;
}

export function StudentDetailPageClient({
  studentId,
}: StudentDetailPageClientProps) {
  const router = useRouter();
  const detailQuery = useStudentDetail(studentId);
  const { openModal } = useStudentEditModalStore();

  if (!Number.isFinite(studentId) || studentId <= 0) {
    return (
      <CenteredError
        title="ID sinh viên không hợp lệ"
        message="Không thể tải trang chi tiết vì tham số đường dẫn không đúng."
        onBack={() => router.push('/admin/students')}
        onRetry={() => router.push('/admin/students')}
      />
    );
  }

  if (detailQuery.isPending && !detailQuery.studentQuery.data) {
    return <StudentDetailSkeleton />;
  }

  if (detailQuery.errorMessage || !detailQuery.studentQuery.data) {
    return (
      <CenteredError
        title="Không thể tải chi tiết sinh viên"
        message={
          detailQuery.errorMessage ?? 'Dữ liệu sinh viên hiện không sẵn sàng.'
        }
        onBack={() => router.push('/admin/students')}
        onRetry={detailQuery.refetchAll}
      />
    );
  }

  const student = detailQuery.studentQuery.data;
  const parents = detailQuery.parentsQuery.data?.data ?? [];
  const scores = detailQuery.scoresQuery.data?.data ?? [];
  const attendance = detailQuery.attendanceQuery.data ?? [];

  const averageScore = calculateWeightedAverageScore(scores);
  const gpaValue = averageScore === null ? null : (averageScore * 0.4);
  const averageScoreLabel =
    gpaValue === null ? '-' : `${gpaValue.toFixed(2)}/4.0`;
  const totalCredits = calculateTotalCredits(scores);
  const attendanceSummary = summarizeAttendance(attendance);

  const parentsError = detailQuery.parentsQuery.error
    ? getApiErrorMessage(
        detailQuery.parentsQuery.error,
        'Không thể tải danh sách phụ huynh.',
      )
    : null;
  const scoresError = detailQuery.scoresQuery.error
    ? getApiErrorMessage(
        detailQuery.scoresQuery.error,
        'Không thể tải kết quả học tập.',
      )
    : null;
  return (
    <div className="w-full space-y-7 pb-12">
      <StudentDetailHeader
        student={student}
        onBack={() => router.push('/admin/students')}
        onPrint={() => window.print()}
        onEdit={() => openModal(student.student_id)}
      />

      <StudentEditModal student={student} />

      <StudentSummaryCards
        averageScoreLabel={averageScoreLabel}
        totalCredits={totalCredits}
        attendanceRate={attendanceSummary.attendanceRate}
      />

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-7">
          <StudentProfileCard student={student} />
          <StudentRecentScoresCard
            scores={scores.slice(0, 5)}
            isLoading={detailQuery.scoresQuery.isPending}
            errorMessage={scoresError}
            onRetry={() => void detailQuery.scoresQuery.refetch()}
            onViewAll={() => {
              const params = new URLSearchParams({
                search: student.student_code,
              });

              if (student.major?.major_name) {
                params.set('major', student.major.major_name);
              }

              router.push(`/admin/scores?${params.toString()}`);
            }}
          />
        </div>

        <div className="space-y-7">
          <StudentParentsCard
            parents={parents}
            isLoading={detailQuery.parentsQuery.isPending}
            errorMessage={parentsError}
            onRetry={() => void detailQuery.parentsQuery.refetch()}
          />
          <StudentAttendanceCalendar attendance={attendance} />
        </div>
      </div>
    </div>
  );
}

function CenteredError({
  title,
  message,
  onBack,
  onRetry,
}: {
  title: string;
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">
      <Card className="max-w-md border-red-200 bg-white shadow-md">
        <CardContent className="space-y-5 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600">{message}</p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-slate-200"
            >
              Quay lại
            </Button>
            <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
