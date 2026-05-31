'use client';

import Link from 'next/link';
import { GraduationCap, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ParentProfileStudent } from '@/types/auth';

interface StudentCardProps {
  student: ParentProfileStudent;
  gpa: string;
}

function getStudyYearLabel(year: number | null): string {
  if (!year) return 'Sinh viên năm 1';
  const labels: Record<number, string> = {
    1: 'Sinh viên năm 1',
    2: 'Sinh viên năm 2',
    3: 'Sinh viên năm 3',
    4: 'Sinh viên năm 4',
  };
  return labels[year] ?? `Năm ${year}`;
}

function getStatusLabel(status?: string | null): string {
  const labels: Record<string, string> = {
    DANG_HOC: 'Đang học',
    BAO_LUU: 'Bảo lưu',
    DINH_CHI: 'Đình chỉ',
    'Đang học': 'Đang học',
    'Bảo lưu': 'Bảo lưu',
    'Đình chỉ': 'Đình chỉ',
  };
  return status ? (labels[status] ?? status) : 'Chưa cập nhật';
}

export function StudentCard({ student, gpa }: StudentCardProps) {
  const initials = student.full_name
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const majorName = student.major?.major_name ?? 'Chưa có ngành';
  const yearLabel = getStudyYearLabel(student.study_year);
  const statusLabel = getStatusLabel(student.status);
  const classLabel = student.class ?? 'Chưa có lớp';

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="h-[86px] w-[86px] overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 via-orange-100 to-orange-200 flex items-center justify-center text-2xl font-black text-orange-700 select-none ring-1 ring-orange-200/60">
              {initials}
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
              {classLabel}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-primary leading-tight">
              {student.full_name}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span>
                MSSV:{' '}
                <span className="font-semibold text-slate-700">{student.student_code}</span>
              </span>
            </div>
          </div>
        </div>

        <Button
          asChild
          size="sm"
          className="shrink-0 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          <Link href="/parent/feedback">
            <MessageSquare className="h-4 w-4" />
            Liên hệ nhà trường
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-4">
        {[
          { label: 'Ngành học', value: majorName },
          { label: 'Năm học', value: yearLabel },
          { label: 'GPA', value: gpa },
          {
            label: 'Tình trạng',
            value: statusLabel,
            green: student.status === 'DANG_HOC' || student.status === 'Đang học',
          },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 bg-white px-5 py-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {stat.label}
            </span>
            <span
              className={`text-sm font-bold leading-snug ${
                stat.green ? 'text-emerald-600' : 'text-slate-900'
              }`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
