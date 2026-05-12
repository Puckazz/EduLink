'use client';

import { BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudentClassSection, ClassStatus } from '@/services/attendance.service';


const STATUS_BADGE: Record<ClassStatus, string> = {
  ONGOING:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  UPCOMING: 'bg-violet-100 text-violet-700 border-violet-200',
  FINISHED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_LABEL: Record<ClassStatus, string> = {
  ONGOING:  'Đang học',
  UPCOMING: 'Sắp học',
  FINISHED: 'Kết thúc',
};

const DAY_VN: Record<string, string> = {
  'Thứ 2': 'Thứ Hai',   'Thứ Hai': 'Thứ Hai',
  'Thứ 3': 'Thứ Ba',    'Thứ Ba': 'Thứ Ba',
  'Thứ 4': 'Thứ Tư',    'Thứ Tư': 'Thứ Tư',
  'Thứ 5': 'Thứ Năm',   'Thứ Năm': 'Thứ Năm',
  'Thứ 6': 'Thứ Sáu',   'Thứ Sáu': 'Thứ Sáu',
  'Thứ 7': 'Thứ Bảy',   'Thứ Bảy': 'Thứ Bảy',
  'Chủ nhật': 'Chủ Nhật', 'Chủ Nhật': 'Chủ Nhật',
  T2: 'Thứ Hai', T3: 'Thứ Ba', T4: 'Thứ Tư',
  T5: 'Thứ Năm', T6: 'Thứ Sáu', T7: 'Thứ Bảy', CN: 'Chủ Nhật',
  Mon: 'Thứ Hai',   Monday: 'Thứ Hai',
  Tue: 'Thứ Ba',    Tuesday: 'Thứ Ba',
  Wed: 'Thứ Tư',    Wednesday: 'Thứ Tư',
  Thu: 'Thứ Năm',   Thursday: 'Thứ Năm',
  Fri: 'Thứ Sáu',   Friday: 'Thứ Sáu',
  Sat: 'Thứ Bảy',   Saturday: 'Thứ Bảy',
  Sun: 'Chủ Nhật',  Sunday: 'Chủ Nhật',
};

function StatusBadge({ status }: { status: ClassStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}


function TableSkeleton() {
  return (
    <div className="space-y-2 p-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

function TableEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        Không có môn học nào trong học kỳ này.
      </p>
    </div>
  );
}


interface ParentScheduleSectionsTableProps {
  sections: StudentClassSection[];
  loading: boolean;
  onRowClick: (section: StudentClassSection) => void;
}

export function ParentScheduleSectionsTable({
  sections,
  loading,
  onRowClick,
}: ParentScheduleSectionsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-base font-bold text-foreground">Danh Sách Môn Học</h2>
        <span className="text-sm text-muted-foreground">
          {loading ? '…' : `${sections.length} môn`}
        </span>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : sections.length === 0 ? (
        <TableEmpty />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {[
                  { label: 'Mã lớp',      align: 'left'   },
                  { label: 'Môn học',      align: 'left'   },
                  { label: 'TC',           align: 'center' },
                  { label: 'Giảng viên',   align: 'left'   },
                  { label: 'Lịch học',     align: 'center' },
                  { label: 'Phòng',        align: 'center' },
                  { label: 'Học kỳ',       align: 'center' },
                  { label: 'Trạng thái',   align: 'center' },
                ].map(({ label, align }) => (
                  <th
                    key={label}
                    className={`py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                      align === 'left' ? 'px-5 text-left' : 'px-3 text-center'
                    }`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sections.map((section) => (
                <tr
                  key={section.section_id}
                  className="group cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => onRowClick(section)}
                >
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-medium text-foreground">
                      {section.class_code}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-foreground leading-tight">
                        {section.subject.subject_name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {section.subject.subject_code}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span className="font-medium text-foreground">
                      {section.subject.credit ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {section.status === 'UPCOMING' ? (
                      <span className="text-muted-foreground/50 text-xs italic">Chưa xác định</span>
                    ) : (
                      <span className="text-foreground">{section.teacher_name}</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-center">
                    {section.status === 'UPCOMING' ? (
                      <span className="text-muted-foreground/50">—</span>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-semibold text-foreground">
                          {DAY_VN[section.day_of_week] ?? section.day_of_week}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {section.start_time} – {section.end_time}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4 text-center">
                    {section.status === 'UPCOMING' ? (
                      <span className="text-muted-foreground/50">—</span>
                    ) : (
                      <span className="text-foreground">{section.room}</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-center">
                    <span className="text-xs text-muted-foreground">{section.semester}</span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <StatusBadge status={section.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Hiển thị {sections.length} môn học
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Đang học
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-violet-400" />
                Sắp học
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Kết thúc
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
