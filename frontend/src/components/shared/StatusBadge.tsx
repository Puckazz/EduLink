import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Status =
  | 'Đang học'
  | 'Bảo lưu'
  | 'Đình chỉ'
  | 'Đã công bố'
  | 'Nháp'
  | 'Đã kích hoạt'
  | 'Chưa kích hoạt'
  | 'Xuất sắc'
  | 'Giỏi'
  | 'Khá'
  | 'Trung bình'
  | 'Yếu'
  | 'Kém'
  | 'A+'
  | 'A'
  | 'B+'
  | 'B'
  | 'C'
  | 'D'
  | 'F';

interface StatusBadgeProps {
  status: Status;
  className?: string;
  label?: string;
}

const BADGE_STYLES = {
  success:
    'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  good: 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-100',
  warning: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  danger: 'bg-red-100 text-red-600 border-red-200 hover:bg-red-100',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100',
} as const;

const statusConfig: Record<Status, string> = {
  'Đang học': BADGE_STYLES.success,
  'Bảo lưu': BADGE_STYLES.warning,
  'Đình chỉ': BADGE_STYLES.danger,
  'Đã công bố': BADGE_STYLES.success,
  Nháp: BADGE_STYLES.neutral,
  'Đã kích hoạt': BADGE_STYLES.success,
  'Chưa kích hoạt': BADGE_STYLES.neutral,
  'Xuất sắc': BADGE_STYLES.success,
  Giỏi: BADGE_STYLES.good,
  Khá: BADGE_STYLES.good,
  'Trung bình': BADGE_STYLES.warning,
  Yếu: BADGE_STYLES.warning,
  Kém: BADGE_STYLES.danger,
  'A+': BADGE_STYLES.success,
  A: BADGE_STYLES.success,
  'B+': BADGE_STYLES.good,
  B: BADGE_STYLES.good,
  C: BADGE_STYLES.warning,
  D: BADGE_STYLES.warning,
  F: BADGE_STYLES.danger,
};

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusConfig[status], 'font-medium text-xs', className)}
    >
      {label ?? status}
    </Badge>
  );
}
