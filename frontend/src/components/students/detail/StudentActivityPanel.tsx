import { FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="border-slate-100 bg-white shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-13 px-5 rounded-none border-b border-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium text-sm transition-colors"
          disabled={!emailHref}
          onClick={() => emailHref && window.location.assign(emailHref)}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <Mail className="h-3.5 w-3.5" />
          </div>
          Gửi email cho phụ huynh
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-13 px-5 rounded-none text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
          onClick={() => window.print()}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <FileText className="h-3.5 w-3.5" />
          </div>
          Xuất bảng điểm (PDF)
        </Button>
      </CardContent>
    </Card>
  );
}
