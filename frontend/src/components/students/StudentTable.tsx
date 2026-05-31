'use client';

import { useRouter } from 'next/navigation';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
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
import { Phone, Mail, Eye, UserX, UserCheck, Trash2 } from 'lucide-react';

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
  onToggleStatus?: (id: string, currentStatus: string) => void;
  onDeleteStudent?: (id: string) => void;
  isToggling?: boolean;
}

const STUDENT_COLUMNS: DataTableColumn[] = [
  { key: 'mssv',    label: 'MSSV',                className: 'w-28 px-6' },
  { key: 'name',    label: 'HỌ TÊN',              className: 'px-4' },
  { key: 'major',   label: 'LỚP / CHUYÊN NGÀNH',  className: 'w-48 px-4' },
  { key: 'parent',  label: 'PHỤ HUYNH LIÊN KẾT',  className: 'w-48 px-4' },
  { key: 'status',  label: 'TRẠNG THÁI',           className: 'w-32 px-4' },
  { key: 'actions', label: 'THAO TÁC', align: 'right', className: 'w-36 px-4' },
];

export function StudentTable({
  students,
  onToggleStatus,
  onDeleteStudent,
  isToggling,
}: StudentTableProps) {
  const router = useRouter();

  return (
    <TooltipProvider>
      <DataTable
        columns={STUDENT_COLUMNS}
        data={students}
        emptyMessage="Không có sinh viên phù hợp với bộ lọc hiện tại."
        renderRow={(student) => (
          <TableRow key={student.id} className="border-border group">

            <TableCell className="px-6 font-medium text-foreground">
              {student.mssv}
            </TableCell>

            <TableCell className="px-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${student.avatarBg}`}>
                  {student.avatarInitials}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.email}</p>
                </div>
              </div>
            </TableCell>

            <TableCell className="px-4">
              <p className="font-medium text-foreground">{student.major}</p>
              <p className="text-xs text-muted-foreground">
                {student.year} · {student.cohort}
              </p>
            </TableCell>

            <TableCell className="px-4">
              <p className="font-medium text-foreground">{student.parentName}</p>
              <div className="mt-0.5 flex items-center gap-1">
                {student.parentContactType === 'phone'
                  ? <Phone className="h-3 w-3 text-muted-foreground" />
                  : <Mail className="h-3 w-3 text-muted-foreground" />
                }
                <span className="text-xs text-muted-foreground">
                  {student.parentContact}
                </span>
              </div>
            </TableCell>

            <TableCell className="px-4">
              <StatusBadge status={student.status} />
            </TableCell>

            <TableCell className="px-4">
              <div className="flex items-center justify-end gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => router.push(`/admin/students/${student.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Xem chi tiết</TooltipContent>
                </Tooltip>

                {student.status === 'Đình chỉ' ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        onClick={() => onToggleStatus?.(student.id, student.status)}
                        disabled={isToggling}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Kích hoạt lại</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onToggleStatus?.(student.id, student.status)}
                        disabled={isToggling}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Đình chỉ</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDeleteStudent?.(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Xóa sinh viên</TooltipContent>
                </Tooltip>

              </div>
            </TableCell>

          </TableRow>
        )}
      />
    </TooltipProvider>
  );
}
