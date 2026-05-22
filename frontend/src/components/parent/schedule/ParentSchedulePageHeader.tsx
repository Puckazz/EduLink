import type { ParentProfileStudent } from '@/types/auth';

interface ParentSchedulePageHeaderProps {
  activeStudent: ParentProfileStudent | null;
}

export function ParentSchedulePageHeader({ activeStudent }: ParentSchedulePageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Thời Khóa Biểu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lịch học và thông tin các môn học
          {activeStudent && (
            <>
              {' '}của{' '}
              <span className="font-semibold text-foreground">
                {activeStudent.full_name}
              </span>{' '}
              ({activeStudent.student_code})
            </>
          )}
        </p>
      </div>
    </div>
  );
}
