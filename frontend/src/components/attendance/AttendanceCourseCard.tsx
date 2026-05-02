import { User, Clock, MapPin, ArrowRight, History, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type CourseStatus = 'ongoing' | 'upcoming' | 'finished';

export interface AttendanceCourseCardProps {
  id: number;
  classCode: string;
  title: string;
  subjectCode: string;
  teacher: string;
  time: string;
  room: string;
  status: CourseStatus;
  topColor: string;
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
  topColor,
  basePath,
  isAdmin = false,
  onEdit,
  onDelete,
}: AttendanceCourseCardProps) {
  const isFinished = status === 'finished';

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow h-full">
      {/* Top colored accent bar */}
      <div className={`h-2 w-full ${topColor}`} />

      {/* Card Header */}
      <div className="px-5 pt-5 pb-3">
        {/* Class code badge + Status + Admin Menu */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            MÃ LỚP: {classCode}
          </span>

          <div className="flex items-center gap-2">
            {status === 'ongoing' && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                Đang diễn ra
              </span>
            )}
            {status === 'upcoming' && (
              <span className="text-sm text-slate-500 font-medium">Sắp diễn ra</span>
            )}
            {status === 'finished' && (
              <span className="text-sm text-slate-500 font-medium">Kết thúc</span>
            )}

            {/* Admin actions kebab menu */}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1">
          {title}
        </h3>
        <p className="text-sm text-slate-500">
          Mã học phần: {subjectCode}
        </p>
      </div>

      {/* Card Body */}
      <div className="flex-1 px-5 py-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <User className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-600">
            Giảng viên:{' '}
            <span className="font-semibold text-slate-800">{teacher}</span>
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-600">{time}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-600">
            Phòng: <span className="font-semibold text-slate-800">{room}</span>
          </span>
        </div>
      </div>

      {/* Card Footer — button */}
      <div className="px-5 pb-5 pt-1">
        <Link href={`${basePath}/${id}`} className="block w-full">
          <button className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-900 hover:bg-slate-700 active:bg-slate-800 transition-colors text-white font-semibold text-sm h-11 px-6 group">
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
      </div>
    </div>
  );
}
