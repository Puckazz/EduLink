import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Venus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Student } from '@/types/student';
import { formatDate } from '@/components/students/mappers/student-detail.mapper';

interface StudentProfileCardProps {
  student: Student;
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900 leading-snug">
        {value}
      </p>
    </div>
  );
}

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-slate-600" />
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Thông tin cá nhân
          </h2>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {/* Row 1 */}
          <InfoItem label="Họ và tên" value={student.full_name} />
          <InfoItem
            label="Ngày sinh"
            value={formatDate(student.date_of_birth)}
          />

          {/* Row 2 */}
          <InfoItem
            label="Giới tính"
            value={
              (student as any).gender === 'NU'
                ? 'Nữ'
                : (student as any).gender === 'NAM'
                  ? 'Nam'
                  : 'Nam'
            }
          />
          <InfoItem
            label="Số điện thoại"
            value={student.parent?.phone ?? '-'}
          />

          {/* Row 3 */}
          <InfoItem label="Email" value={student.email ?? '-'} />
          <InfoItem
            label="Địa chỉ thường trú"
            value={student.class ?? '-'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
