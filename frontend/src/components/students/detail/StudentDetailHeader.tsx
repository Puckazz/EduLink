'use client';

import { BookOpen, CalendarDays, GraduationCap, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Student } from '@/types/student';
import { getInitials } from '@/components/students/mappers/student-detail.mapper';

interface StudentDetailHeaderProps {
  student: Student;
  onBack: () => void;
  onPrint: () => void;
  onEdit?: () => void;
}

export function StudentDetailHeader({
  student,
  onBack,
  onPrint,
  onEdit,
}: StudentDetailHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.2),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.12),transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative px-6 pb-8 pt-8 md:px-10 md:pt-10 md:pb-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative h-[80px] w-[80px] shrink-0">
              <div className="h-full w-full rounded-2xl border-2 border-white/20 bg-gradient-to-br from-indigo-500 via-slate-600 to-slate-700 shadow-2xl flex items-center justify-center text-2xl font-black text-white/95 tracking-tight select-none">
                {getInitials(student.full_name)}
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-800 bg-emerald-400 shadow-sm" />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
                  {student.full_name}
                </h1>
                <StatusBadge status={student.status} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-500 text-xs">MSSV</span>
                  <span className="font-semibold text-white/90">{student.student_code}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-500 text-xs">Khoa</span>
                  <span className="font-medium text-slate-200">
                    {student.major?.major_name ?? 'Chưa có chuyên ngành'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-500 text-xs">Khóa</span>
                  <span className="font-medium text-slate-200">{student.cohort ?? 'N/A'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <Button
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all shadow-sm gap-2 backdrop-blur-sm"
              onClick={onEdit}
              size="sm"
            >
              <PencilLine className="h-4 w-4" />
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
