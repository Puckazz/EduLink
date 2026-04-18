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
}

export function StudentDetailHeader({
  student,
  onBack,
  onPrint,
}: StudentDetailHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_50%),linear-gradient(135deg,rgba(15,23,42,0.99),rgba(30,41,59,0.97))]" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(rgba(148,163,184,0.3)_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="relative px-6 pb-7 pt-7 md:px-8 md:pt-9 md:pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl border-4 border-white/25 shadow-2xl">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600 text-2xl font-black text-white/90">
                {getInitials(student.full_name)}
              </div>
            </div>

            {/* Name + meta */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {student.full_name}
                </h1>
                <StatusBadge status={student.status} />
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-400 text-xs">MSSV:</span>
                  <span className="font-semibold text-white">{student.student_code}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-400 text-xs">Khoa</span>
                  <span className="font-medium">
                    {student.major?.major_name ?? 'Chưa có chuyên ngành'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-400 text-xs">Khóa</span>
                  <span className="font-medium">{student.cohort ?? 'N/A'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Edit button */}
          <div className="shrink-0">
            <Button
              className="bg-white text-slate-900 hover:bg-slate-100 font-semibold transition-all shadow-lg gap-2"
              disabled
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
