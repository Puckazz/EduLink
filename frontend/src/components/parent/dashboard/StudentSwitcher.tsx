'use client';

import { Users } from 'lucide-react';
import type { ParentProfileStudent } from '@/types/auth';

interface StudentSwitcherProps {
  students: ParentProfileStudent[];
  selectedId: number;
  onSelect: (id: number) => void;
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// Palette cycles through for each student index
const AVATAR_PALETTES = [
  'from-amber-100 via-orange-100 to-orange-200 text-orange-700 ring-orange-200/60',
  'from-blue-100 via-indigo-100 to-indigo-200 text-indigo-700 ring-indigo-200/60',
  'from-emerald-100 via-teal-100 to-teal-200 text-teal-700 ring-teal-200/60',
  'from-rose-100 via-pink-100 to-pink-200 text-pink-700 ring-pink-200/60',
  'from-violet-100 via-purple-100 to-purple-200 text-purple-700 ring-purple-200/60',
];

export function StudentSwitcher({ students, selectedId, onSelect }: StudentSwitcherProps) {
  if (students.length <= 1) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm px-5 py-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Users className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-bold text-slate-900">Chọn học sinh</span>
        <span className="ml-auto text-xs text-slate-400">{students.length} học sinh đã liên kết</span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {students.map((student, idx) => {
          const isActive = student.student_id === selectedId;
          const palette = AVATAR_PALETTES[idx % AVATAR_PALETTES.length];

          return (
            <button
              key={student.student_id}
              onClick={() => onSelect(student.student_id)}
              className={`
                group relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-slate-900 shadow-md'
                  : 'border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                }
              `}
            >
              {/* Avatar */}
              <div
                className={`
                  h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br flex items-center justify-center
                  text-sm font-black select-none ring-1 transition-transform duration-200
                  group-hover:scale-105
                  ${isActive ? 'from-white/20 via-white/10 to-white/5 text-white ring-white/20' : palette}
                `}
              >
                {getInitials(student.full_name)}
              </div>

              {/* Info */}
              <div className="text-left">
                <p
                  className={`text-sm font-bold leading-tight truncate max-w-[140px] ${
                    isActive ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {student.full_name}
                </p>
                <p
                  className={`text-[11px] leading-tight ${
                    isActive ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {student.student_code}
                  {student.major?.major_name ? ` · ${student.major.major_name}` : ''}
                </p>
              </div>

              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-white shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
