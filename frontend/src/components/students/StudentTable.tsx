'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/table/DataTable';
import { Phone, Mail, MoreHorizontal } from 'lucide-react';

type Status = 'Đang học' | 'Bảo lưu' | 'Đình chỉ';

export interface StudentTableStudent {
  id: string;
  mssv: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarBg: string;
  major: string;
  year: string;
  cohort: string;
  parentName: string;
  parentContact: string;
  parentContactType: 'phone' | 'email';
  status: Status;
}

interface StudentTableProps {
  students: StudentTableStudent[];
}

const STUDENT_COLUMNS: DataTableColumn[] = [
  {
    key: 'mssv',
    label: 'MSSV',
    className: 'w-28 px-6',
  },
  {
    key: 'name',
    label: 'HỌ TÊN',
    className: 'px-4',
  },
  {
    key: 'major',
    label: 'LỚP / CHUYÊN NGÀNH',
    className: 'w-48 px-4',
  },
  {
    key: 'parent',
    label: 'PHỤ HUYNH LIÊN KẾT',
    className: 'w-48 px-4',
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
    className: 'w-20 px-4',
  },
];

export function StudentTable({ students }: StudentTableProps) {
  return (
    <DataTable
      columns={STUDENT_COLUMNS}
      data={students}
      emptyMessage="Không có sinh viên phù hợp với bộ lọc hiện tại."
      renderRow={(student) => (
        <TableRow key={student.id} className="border-border">
          {/* MSSV */}
          <TableCell className="px-6 font-medium text-foreground">
            {student.mssv}
          </TableCell>

          {/* Name + email */}
          <TableCell className="px-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${student.avatarBg}`}
              >
                {student.avatarInitials}
              </div>
              <div>
                <p className="font-semibold text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.email}</p>
              </div>
            </div>
          </TableCell>

          {/* Major + year */}
          <TableCell className="px-4">
            <p className="font-medium text-foreground">{student.major}</p>
            <p className="text-xs text-muted-foreground">
              {student.year} · {student.cohort}
            </p>
          </TableCell>

          {/* Parent */}
          <TableCell className="px-4">
            <p className="font-medium text-foreground">{student.parentName}</p>
            <div className="mt-0.5 flex items-center gap-1">
              {student.parentContactType === 'phone' ? (
                <Phone className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Mail className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">
                {student.parentContact}
              </span>
            </div>
          </TableCell>

          {/* Status */}
          <TableCell className="px-4">
            <StatusBadge status={student.status} />
          </TableCell>

          {/* Actions */}
          <TableCell className="px-4 text-right">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      )}
    />
  );
}
