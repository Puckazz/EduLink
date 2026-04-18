import { FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Attendance } from '@/types/attendance';
import type { Student, StudentParentDetail } from '@/types/student';

interface StudentActivityPanelProps {
  student: Student;
  parents: StudentParentDetail[];
  attendance: Attendance[];
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
}

export function StudentActivityPanel({
  student,
  parents,
}: StudentActivityPanelProps) {
  const primaryParent = parents[0] ?? null;
  const emailTarget = primaryParent?.email ?? student.email ?? null;
  const emailHref = emailTarget ? `mailto:${emailTarget}` : null;

  return (
    <div className="grid gap-3">
      {/* Gửi email cho phụ huynh */}
      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-11 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm shadow-sm"
        disabled={!emailHref}
        onClick={() => emailHref && window.location.assign(emailHref)}
      >
        <Mail className="h-4 w-4 shrink-0" />
        Gửi email cho phụ huynh
      </Button>

      {/* Xuất bảng điểm PDF */}
      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-11 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm shadow-sm"
        onClick={() => window.print()}
      >
        <FileText className="h-4 w-4 shrink-0" />
        Xuất bảng điểm (PDF)
      </Button>
    </div>
  );
}
