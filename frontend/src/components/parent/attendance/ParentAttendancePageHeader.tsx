import type { ParentProfileStudent } from '@/types/auth';

interface ParentAttendancePageHeaderProps {
  activeStudent: ParentProfileStudent | null;
}

export function ParentAttendancePageHeader({ activeStudent }: ParentAttendancePageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Chuyên Cần</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi tỷ lệ điểm danh và chuyên cần
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
