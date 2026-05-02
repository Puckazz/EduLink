import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AttendanceEmptyCardProps {
  isAdmin?: boolean;
  onCreateClick?: () => void;
}

export function AttendanceEmptyCard({ isAdmin = false, onCreateClick }: AttendanceEmptyCardProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 shadow-none bg-transparent h-full min-h-[340px] rounded-2xl">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Plus className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
        {isAdmin ? 'Tạo lớp học mới?' : 'Không tìm thấy lớp học khác?'}
      </h3>
      <p className="text-sm text-slate-500 mt-2 text-center max-w-[200px]">
        {isAdmin
          ? 'Bấm bên dưới để tạo lớp học phần mới.'
          : 'Liên hệ quản lý giáo vụ để cập nhật.'}
      </p>
      {isAdmin && (
        <Button className="mt-4 gap-2" size="sm" onClick={onCreateClick}>
          <Plus className="h-4 w-4" />
          Tạo lớp mới
        </Button>
      )}
    </Card>
  );
}
