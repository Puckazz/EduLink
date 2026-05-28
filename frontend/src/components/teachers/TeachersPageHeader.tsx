import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeachersPageHeaderProps {
  totalItems: number;
  onAddTeacher: () => void;
}

export function TeachersPageHeader({
  totalItems,
  onAddTeacher,
}: TeachersPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Quản Lý Giảng viên
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tổng cộng:{' '}
          <span className="font-semibold text-foreground">{totalItems}</span>{' '}
          giảng viên trong hệ thống
        </p>
      </div>

      <Button className="gap-2" onClick={onAddTeacher}>
        <Plus className="h-4 w-4" />
        Thêm giảng viên mới
      </Button>
    </div>
  );
}
