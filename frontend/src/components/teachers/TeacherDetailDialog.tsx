'use client';

import { CalendarDays, Mail, Phone, UserRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format-date';
import type { Teacher } from '@/types/teacher';

interface TeacherDetailDialogProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export function TeacherDetailDialog({
  teacher,
  isOpen,
  onOpenChange,
}: TeacherDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết giảng viên</DialogTitle>
          <DialogDescription>
            Thông tin tài khoản và số lớp học phần đang phụ trách.
          </DialogDescription>
        </DialogHeader>

        {teacher && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {teacher.full_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  @{teacher.username}
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-100"
              >
                {teacher.class_section_count} lớp
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <DetailRow
                icon={Mail}
                label="Email"
                value={teacher.email ?? 'Chưa cập nhật'}
              />
              <DetailRow
                icon={Phone}
                label="Số điện thoại"
                value={teacher.phone ?? 'Chưa cập nhật'}
              />
              <DetailRow
                icon={CalendarDays}
                label="Ngày tạo"
                value={formatDate(teacher.created_at)}
              />
              <DetailRow
                icon={UserRound}
                label="Mã giảng viên"
                value={`#GV${String(teacher.teacher_id).padStart(5, '0')}`}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
