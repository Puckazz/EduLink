import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Status = 'Đang học' | 'Bảo lưu' | 'Đình chỉ' | 'Đã công bố' | 'Nháp';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, string> = {
  'Đang học': 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
  'Bảo lưu':
    'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
  'Đình chỉ': 'bg-red-100 text-red-600 border-red-200 hover:bg-red-100',
  'Đã công bố':
    'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  Nháp: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusConfig[status], 'font-medium text-xs', className)}
    >
      {status}
    </Badge>
  );
}
