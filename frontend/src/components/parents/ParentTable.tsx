'use client';

import { Eye, Lock, LockOpen, Mail, Pencil, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/table/DataTable';
import type { ParentTableRow } from '@/components/parents/mappers/parent.mapper';

const RELATIONSHIP_BADGE_CLASS: Record<
  ParentTableRow['raw']['relationship'],
  string
> = {
  CHA: 'border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-100',
  ME: 'border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100',
  NGUOI_GIAM_HO:
    'border-violet-200 bg-violet-100 text-violet-700 hover:bg-violet-100',
};

interface ParentTableProps {
  parents: ParentTableRow[];
  onViewDetails: (parentId: number) => void;
  onEditParent: (parentId: number) => void;
  onToggleLock: (parentId: number) => void;
}

const PARENT_COLUMNS: DataTableColumn[] = [
  {
    key: 'id',
    label: 'ID',
    className: 'w-28 px-6',
  },
  {
    key: 'parent',
    label: 'PHỤ HUYNH',
    className: 'px-4',
  },
  {
    key: 'contact',
    label: 'THÔNG TIN LIÊN LẠC',
    className: 'w-52 px-4',
  },
  {
    key: 'student',
    label: 'SINH VIÊN LIÊN KẾT',
    className: 'w-40 px-4',
  },
  {
    key: 'relationship',
    label: 'MỐI QUAN HỆ',
    className: 'w-36 px-4',
  },
  {
    key: 'status',
    label: 'TRẠNG THÁI',
    className: 'w-36 px-4',
  },
  {
    key: 'actions',
    label: 'HÀNH ĐỘNG',
    align: 'right',
    className: 'w-36 px-4',
  },
];

export function ParentTable({
  parents,
  onViewDetails,
  onEditParent,
  onToggleLock,
}: ParentTableProps) {
  return (
    <DataTable
      columns={PARENT_COLUMNS}
      data={parents}
      emptyMessage="Không có phụ huynh phù hợp với bộ lọc hiện tại."
      renderRow={(parent) => (
        <TableRow key={parent.id} className="border-border">
          <TableCell className="px-6 font-medium text-muted-foreground">
            {parent.displayId}
          </TableCell>

          <TableCell className="px-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${parent.avatarBg}`}
              >
                {parent.avatarInitials}
              </div>
              <p className="font-semibold text-foreground">{parent.fullName}</p>
            </div>
          </TableCell>

          <TableCell className="space-y-1 px-4">
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              {parent.phone}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {parent.email}
            </div>
          </TableCell>

          <TableCell className="px-4 text-sm text-blue-600">
            {parent.linkedStudentText}
          </TableCell>

          <TableCell className="px-4">
            <Badge
              variant="outline"
              className={RELATIONSHIP_BADGE_CLASS[parent.raw.relationship]}
            >
              {parent.relationshipLabel}
            </Badge>
          </TableCell>

          <TableCell className="px-4">
            <StatusBadge status={parent.statusLabel} />
          </TableCell>

          <TableCell className="px-4 text-right">
            <div className="inline-flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => onViewDetails(parent.raw.parent_id)}
                title="Xem chi tiết"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => onEditParent(parent.raw.parent_id)}
                title="Chỉnh sửa"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => onToggleLock(parent.raw.parent_id)}
                title={parent.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              >
                {parent.isActive ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <LockOpen className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )}
    />
  );
}
