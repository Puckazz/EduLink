'use client';

import { GraduationCap, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ParentProfile, ParentProfileStudent } from '@/types/auth';

interface StudentCardProps {
  profile: ParentProfile;
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

export function StudentCard({ profile, student, gpa }: StudentCardProps) {
  const initials = student.full_name
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const majorName = student.major?.major_name ?? 'Chưa có ngành';
  const yearLabel = getStudyYearLabel(student.study_year);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Top section: avatar + name + button */}
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Avatar + Info */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-[86px] w-[86px] overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 via-orange-100 to-orange-200 flex items-center justify-center text-2xl font-black text-orange-700 select-none ring-1 ring-orange-200/60">
              {initials}
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
              Trên trường
            </span>
          </div>

          {/* Name + MSSV */}
          <div className="space-y-1.5 pt-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
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

        {/* CTA button */}
        <Button
          size="sm"
          className="shrink-0 gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold shadow"
          onClick={() => {
            if (profile.email) window.location.href = `mailto:${profile.email}`;
          }}
        >
          <Mail className="h-4 w-4" />
          Liên hệ cố vấn
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-4">
        {[
          { label: 'Ngành học', value: majorName },
          { label: 'Năm học', value: yearLabel },
          { label: 'GPA', value: gpa },
          { label: 'Tình trạng', value: 'Đang học tập tốt', green: true },
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
