import { MessageSquare } from 'lucide-react';
import { type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/table/DataTable';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'none';

export interface StudentAttendance {
  id: string;
  name: string;
  mssv: string;
  avatar: string;
  status: AttendanceStatus;
  note: string;
  hasMessage: boolean;
}

interface TableProps {
  students: StudentAttendance[];
  onStatusChange: (id: string, status: AttendanceStatus) => void;
  onNoteChange: (id: string, note: string) => void;
  footer?: ReactNode;
}

const ATTENDANCE_COLUMNS: DataTableColumn[] = [
  {
    key: 'student',
    label: 'Sinh viên',
    className: 'py-4 px-6 w-[30%]',
  },
  {
    key: 'status',
    label: 'Trạng thái',
    className: 'w-[35%]',
  },
  {
    key: 'note',
    label: 'Ghi chú',
    className: 'w-[25%]',
  },
  {
    key: 'actions',
    label: 'Thao tác',
    align: 'center',
    className: 'w-[10%]',
  },
];

export function AttendanceDetailTableCard({
  students,
  onStatusChange,
  onNoteChange,
  footer,
}: TableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-card shadow-sm overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <DataTable
          columns={ATTENDANCE_COLUMNS}
          data={students}
          emptyMessage="Không có sinh viên trong buổi học."
          renderRow={(student) => {
            const isPresent = student.status === 'present';
            const isLate = student.status === 'late';
            const isAbsent = student.status === 'absent';

            return (
              <TableRow key={student.id} className="hover:bg-slate-50/50">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 overflow-hidden rounded-full shrink-0">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">
                        {student.name}
                      </span>
                      <span className="mt-0.5 text-xs font-medium text-slate-500">
                        MSSV: {student.mssv}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onStatusChange(student.id, 'present')}
                      className={`rounded-md px-5 py-1.5 text-sm font-bold transition-all ${
                        isPresent
                          ? 'bg-emerald-100 text-emerald-700 shadow-xs ring-1 ring-emerald-400 ring-inset'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      Có mặt
                    </button>
                    <button
                      onClick={() => onStatusChange(student.id, 'late')}
                      className={`rounded-md px-5 py-1.5 text-sm font-bold transition-all ${
                        isLate
                          ? 'bg-amber-100 text-amber-700 shadow-xs ring-1 ring-amber-400 ring-inset'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      Muộn
                    </button>
                    <button
                      onClick={() => onStatusChange(student.id, 'absent')}
                      className={`rounded-md px-5 py-1.5 text-sm font-bold transition-all ${
                        isAbsent
                          ? 'bg-red-50 text-red-600 shadow-xs ring-1 ring-red-300 ring-inset'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      Vắng
                    </button>
                  </div>
                </TableCell>

                <TableCell>
                  <div
                    className={`w-full rounded-md p-px transition-colors sm:w-auto ${
                      isAbsent && student.note ? 'bg-red-100' : ''
                    }`}
                  >
                    <Input
                      placeholder="Thêm ghi chú..."
                      value={student.note}
                      onChange={(event) =>
                        onNoteChange(student.id, event.target.value)
                      }
                      className={`h-9 border-transparent bg-transparent text-sm font-semibold shadow-none focus-visible:border-slate-300 focus-visible:ring-0 ${
                        student.note
                          ? isAbsent
                            ? 'bg-red-50 text-red-700 placeholder-red-300 hover:bg-red-100'
                            : 'text-slate-700 hover:bg-slate-50'
                          : 'text-slate-400 hover:bg-slate-50'
                      }`}
                    />
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <button className="group relative inline-flex rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                    <MessageSquare
                      className="h-5 w-5"
                      fill={student.hasMessage ? 'currentColor' : 'none'}
                    />
                    {student.hasMessage && (
                      <span className="absolute top-1.5 right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                    )}
                  </button>
                </TableCell>
              </TableRow>
            );
          }}
        />
      </div>
      {footer}
    </div>
  );
}
