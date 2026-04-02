import { AlertCircle, RefreshCcw } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  StudentTable,
  type StudentTableStudent,
} from '@/components/students/StudentTable';

interface StudentsTableCardProps {
  errorMessage: string | null;
  isLoading: boolean;
  students: StudentTableStudent[];
  onRetry: () => void;
  footer: ReactNode;
}

function StudentTableSkeleton() {
  return (
    <div className="space-y-3 px-6 py-5">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  );
}

export function StudentsTableCard({
  errorMessage,
  isLoading,
  students,
  onRetry,
  footer,
}: StudentsTableCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
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
        <StudentTableSkeleton />
      ) : (
        <StudentTable students={students} />
      )}

      {footer}
    </div>
  );
}
