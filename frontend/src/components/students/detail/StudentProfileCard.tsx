import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Mail,
  School,
  UserRound,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Student } from '@/types/student';
import { formatDate } from '@/components/students/mappers/student-detail.mapper';

interface StudentProfileCardProps {
  student: Student;
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800 wrap-break-word leading-snug">
          {value}
        </p>
      </div>
    </div>
  );
}

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  return (
    <Card className="border-slate-100 bg-white shadow-sm">
      <CardContent className="p-6 space-y-1">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <UserRound className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Thông tin cá nhân
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-6">
          <InfoItem
            icon={<UserRound className="h-4 w-4" />}
            label="Họ và tên"
            value={student.full_name}
          />
          <InfoItem
            icon={<CalendarDays className="h-4 w-4" />}
            label="Ngày sinh"
            value={formatDate(student.date_of_birth)}
          />
          <InfoItem
            icon={<School className="h-4 w-4" />}
            label="Lớp"
            value={student.class ?? '-'}
          />
          <InfoItem
            icon={<BookOpen className="h-4 w-4" />}
            label="Ngành học"
            value={student.major?.major_name ?? '-'}
          />
          <InfoItem
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={student.email ?? '-'}
          />
          <InfoItem
            icon={<GraduationCap className="h-4 w-4" />}
            label="Khóa"
            value={student.cohort ?? '-'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
