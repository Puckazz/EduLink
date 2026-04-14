import { User, Clock, MapPin, ArrowRight, History } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type CourseStatus = 'ongoing' | 'upcoming' | 'finished';

interface AttendanceCourseCardProps {
  classCode: string;
  title: string;
  subjectCode: string;
  teacher: string;
  time: string;
  room: string;
  status: CourseStatus;
  topColor: string;
}

export function AttendanceCourseCard({
  classCode,
  title,
  subjectCode,
  teacher,
  time,
  room,
  status,
  topColor,
}: AttendanceCourseCardProps) {
  const isFinished = status === 'finished';
  
  return (
    <Card className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow border-slate-200 h-full relative rounded-2xl">
      {/* Top colored bar */}
      <div className={`h-2.5 w-full ${topColor}`} />
      
      <CardHeader className="pb-2 pt-5">
        <div className="flex justify-between items-center mb-4">
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-semibold rounded-md uppercase text-[10px] tracking-wide hover:bg-slate-100">
            MÃ LỚP: {classCode}
          </Badge>
          
          {status === 'ongoing' && (
            <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none font-semibold px-2 flex gap-1.5 items-center">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Đang diễn ra
            </Badge>
          )}
          {status === 'upcoming' && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-medium px-2.5 hover:bg-slate-100">
              Sắp diễn ra
            </Badge>
          )}
          {status === 'finished' && (
            <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-medium px-2.5 hover:bg-slate-100">
              Kết thúc
            </Badge>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-500 font-medium mt-1.5">
          Mã học phần: {subjectCode}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 pt-4 pb-6 space-y-3.5">
        <div className="flex items-start gap-3">
          <User className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Giảng viên: <span className="font-semibold text-slate-800">{teacher}</span>
          </span>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {time}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Phòng: <span className="font-semibold text-slate-800">{room}</span>
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link href={`/admin/attendance/course-${classCode.toLowerCase()}`} className="w-full">
          <Button 
            className={`w-full font-semibold group h-11 ${
              isFinished 
                ? 'bg-slate-900 hover:bg-slate-800' 
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {isFinished ? (
              <>
                Xem lịch sử điểm danh <History className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Quản lý điểm danh <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
