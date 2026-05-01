import { User, Clock, MapPin, ArrowRight, History } from 'lucide-react';
import Link from 'next/link';

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
}: AttendanceCourseCardProps) {
  const isFinished = status === 'finished';

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow h-full">
      {/* Top colored accent bar */}
      <div className={`h-2 w-full ${topColor}`} />

      {/* Card Header */}
      <div className="px-5 pt-5 pb-3">
        {/* Class code badge + Status */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            MÃ LỚP: {classCode}
          </span>

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
