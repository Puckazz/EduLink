import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentsPageHeaderProps {
  onAddStudent: () => void;
}

export function StudentsPageHeader({ onAddStudent }: StudentsPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Quản Lý Sinh Viên
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý tuyển sinh, xem hồ sơ và cập nhật thông tin sinh viên.
        </p>
      </div>
      <Button className="shrink-0 gap-2" onClick={onAddStudent}>
        <Plus className="h-4 w-4" />
        Thêm sinh viên mới
      </Button>
    </div>
  );
}
