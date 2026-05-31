import { AlertCircle, RefreshCcw } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TeacherTable } from '@/components/teachers/TeacherTable';
import type { TeacherTableRow } from '@/components/teachers/mappers/teacher.mapper';

interface TeachersTableCardProps {
  errorMessage: string | null;
  isLoading: boolean;
  teachers: TeacherTableRow[];
  onRetry: () => void;
  onViewDetails: (teacherId: number) => void;
  onEditTeacher: (teacherId: number) => void;
  onToggleLock: (teacherId: number) => void;
  footer: ReactNode;
}

function TeacherTableSkeleton() {
  return (
    <div className="space-y-3 px-6 py-5">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  );
}

export function TeachersTableCard({
  errorMessage,
  isLoading,
  teachers,
  onRetry,
  onViewDetails,
  onEditTeacher,
  onToggleLock,
  footer,
}: TeachersTableCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      {errorMessage ? (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Không thể tải dữ liệu
            </p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={onRetry}>
            <RefreshCcw className="h-4 w-4" />
            Thử lại
          </Button>
        </div>
      ) : isLoading ? (
        <TeacherTableSkeleton />
      ) : (
        <TeacherTable
          teachers={teachers}
          onViewDetails={onViewDetails}
          onEditTeacher={onEditTeacher}
          onToggleLock={onToggleLock}
        />
      )}

      {footer}
    </div>
  );
}
