'use client';

import {
  BookOpen,
  Eye,
  Lock,
  LockOpen,
  Mail,
  Pencil,
  Phone,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/table/DataTable';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TeacherTableRow } from '@/components/teachers/mappers/teacher.mapper';

interface TeacherTableProps {
  teachers: TeacherTableRow[];
  onViewDetails: (teacherId: number) => void;
  onEditTeacher: (teacherId: number) => void;
  onToggleLock: (teacherId: number) => void;
}

const TEACHER_COLUMNS: DataTableColumn[] = [
  {
    key: 'id',
    label: 'ID',
    className: 'w-28 px-6',
  },
  {
    key: 'teacher',
    label: 'GIẢNG VIÊN',
    className: 'px-4',
  },
  {
    key: 'contact',
    label: 'THÔNG TIN LIÊN LẠC',
    className: 'w-56 px-4',
  },
  {
    key: 'classes',
    label: 'LỚP PHỤ TRÁCH',
    className: 'w-40 px-4',
  },
  {
    key: 'created',
    label: 'NGÀY TẠO',
    className: 'w-32 px-4',
  },
  {
    key: 'status',
    label: 'TRẠNG THÁI',
    className: 'w-32 px-4',
  },
  {
    key: 'actions',
    label: 'THAO TÁC',
    align: 'right',
    className: 'w-32 px-4',
  },
];

export function TeacherTable({
  teachers,
  onViewDetails,
  onEditTeacher,
  onToggleLock,
}: TeacherTableProps) {
  return (
    <TooltipProvider>
      <DataTable
        columns={TEACHER_COLUMNS}
        data={teachers}
        emptyMessage="Không có giảng viên phù hợp với bộ lọc hiện tại."
        renderRow={(teacher) => (
        <TableRow key={teacher.id} className="border-border group">
          <TableCell className="px-6 font-medium text-muted-foreground">
            {teacher.displayId}
          </TableCell>

          <TableCell className="px-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${teacher.avatarBg}`}
              >
                {teacher.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {teacher.fullName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{teacher.username}
                </p>
              </div>
            </div>
          </TableCell>

          <TableCell className="space-y-1 px-4">
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              {teacher.phone}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {teacher.email}
            </div>
          </TableCell>

          <TableCell className="px-4">
            <Badge
              variant="outline"
              className="border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-100"
            >
              <BookOpen className="mr-1 h-3.5 w-3.5" />
              {teacher.classSectionText}
            </Badge>
          </TableCell>

          <TableCell className="px-4 text-sm text-muted-foreground">
            {teacher.createdAtText}
          </TableCell>

          <TableCell className="px-4">
            <StatusBadge status={teacher.statusLabel} />
          </TableCell>

          <TableCell className="px-4">
            <div className="flex items-center justify-end gap-0.5 opacity-40 transition-opacity duration-150 group-hover:opacity-100">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    onClick={() => onViewDetails(teacher.raw.teacher_id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Xem chi tiết</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    onClick={() => onEditTeacher(teacher.raw.teacher_id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Chỉnh sửa</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={
                      teacher.raw.is_locked
                        ? 'h-8 w-8 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950'
                        : 'h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                    }
                    onClick={() => onToggleLock(teacher.raw.teacher_id)}
                  >
                    {teacher.raw.is_locked ? (
                      <LockOpen className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {teacher.raw.is_locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                </TooltipContent>
              </Tooltip>
            </div>
          </TableCell>
        </TableRow>
      )}
      />
    </TooltipProvider>
  );
}
