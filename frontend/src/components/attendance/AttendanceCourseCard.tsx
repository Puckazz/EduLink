import { User, Clock, MapPin, ArrowRight, History, MoreVertical, Pencil, Trash2, Lock } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ClassStatus } from '@/types/attendance';
import { CLASS_STATUS_CONFIG } from './class-status.config';

export interface AttendanceCourseCardProps {
  id: number;
  classCode: string;
  title: string;
  subjectCode: string;
  teacher: string;
  time: string;
  room: string;
  status: ClassStatus;
  basePath: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AttendanceCourseCard({
  id,
  classCode,
  title,
  subjectCode,
  teacher,
  time,
  room,
  status,
  basePath,
  isAdmin = false,
  onEdit,
  onDelete,
}: AttendanceCourseCardProps) {
  const cfg = CLASS_STATUS_CONFIG[status];
  const isFinished = status === 'FINISHED';
  const isUpcoming = status === 'UPCOMING';
  const shouldLockAttendance = isUpcoming && !isAdmin;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow h-full">
      <div className={`h-2 w-full ${cfg.topColorClass}`} />

      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            MÃ LỚP: {classCode}
          </span>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${status === 'ONGOING' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {status === 'ONGOING' && (
                <span className={`h-2 w-2 rounded-full ${cfg.dotClass} inline-block`} />
              )}
              {status === 'FINISHED' ? 'Kết thúc' : cfg.label}
            </span>

            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Tùy chọn"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={(e: React.MouseEvent) => { e.preventDefault(); onEdit?.(); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={(e: React.MouseEvent) => { e.preventDefault(); onDelete?.(); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa lớp học
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-foreground leading-tight mb-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">
          Mã học phần: {subjectCode}
        </p>
      </div>

      <div className="flex-1 px-5 py-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">
            Giảng viên:{' '}
            <span className="font-semibold text-foreground">{teacher}</span>
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">{time}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">
            Phòng: <span className="font-semibold text-foreground">{room}</span>
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 pt-1">
        {shouldLockAttendance ? (
          <button
            type="button"
            disabled
            className="w-full flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-muted text-muted-foreground font-semibold text-sm h-11 px-6"
            title="Lớp sắp diễn ra, chưa thể điểm danh."
          >
            <Lock className="h-4 w-4" />
            Chưa mở điểm danh
          </button>
        ) : (
          <Link href={`${basePath}/${id}`} className="block w-full">
            <button className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all text-primary-foreground font-semibold text-sm h-11 px-6 group">
              {isFinished ? (
                <>
                  Xem lịch sử điểm danh
                  <History className="h-4 w-4" />
                </>
              ) : (
                <>
                  Quản lý điểm danh
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
