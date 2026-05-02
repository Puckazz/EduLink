import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttendancePageHeaderProps {
  isAdmin?: boolean;
  onCreateClick?: () => void;
  onImportClick?: () => void;
}

export function AttendancePageHeader({
  isAdmin = false,
  onCreateClick,
  onImportClick,
}: AttendancePageHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
      <div className="max-w-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 mb-2">
          Danh sách Khóa học & Lớp học
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Chọn một lớp học để bắt đầu quản lý điểm danh và theo dõi tiến độ sinh viên.
        </p>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-3 shrink-0">
          <Button
            id="btn-import-class"
            variant="outline"
            className="gap-2"
            onClick={onImportClick}
          >
            <Upload className="h-4 w-4" />
            Import Excel
          </Button>
          <Button
            id="btn-create-class"
            className="gap-2"
            onClick={onCreateClick}
          >
            <Plus className="h-4 w-4" />
            Tạo lớp mới
          </Button>
        </div>
      )}
    </div>
  );
}
