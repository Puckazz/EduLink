'use client';

import { BookOpen, Eye, Mail, Pencil, Phone, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/table/DataTable';
import type { TeacherTableRow } from '@/components/teachers/mappers/teacher.mapper';

interface TeacherTableProps {
  teachers: TeacherTableRow[];
  onViewDetails: (teacherId: number) => void;
  onEditTeacher: (teacherId: number) => void;
  onDeleteTeacher: (teacherId: number) => void;
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
    key: 'actions',
    label: 'HÀNH ĐỘNG',
    align: 'right',
    className: 'w-32 px-4',
  },
];

export function TeacherTable({
  teachers,
  onViewDetails,
  onEditTeacher,
  onDeleteTeacher,
}: TeacherTableProps) {
  return (
    <DataTable
      columns={TEACHER_COLUMNS}
      data={teachers}
      emptyMessage="Không có giảng viên phù hợp với bộ lọc hiện tại."
      renderRow={(teacher) => (
        <TableRow key={teacher.id} className="border-border">
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

          <TableCell className="px-4 text-right">
            <div className="inline-flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => onViewDetails(teacher.raw.teacher_id)}
                title="Xem chi tiết"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => onEditTeacher(teacher.raw.teacher_id)}
                title="Chỉnh sửa"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={() => onDeleteTeacher(teacher.raw.teacher_id)}
                title="Xóa giảng viên"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )}
    />
  );
}
