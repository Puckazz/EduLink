import type { ClassStatus } from '@/types/attendance';

export const CLASS_STATUS_CONFIG: Record<
  ClassStatus,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
    accentClass: string;
    topColorClass: string;
  }
> = {
  ONGOING: {
    label: 'Đang diễn ra',
    badgeClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    dotClass: 'bg-emerald-500',
    accentClass: 'from-emerald-500 to-teal-600',
    topColorClass: 'bg-emerald-500',
  },
  UPCOMING: {
    label: 'Sắp diễn ra',
    badgeClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    dotClass: 'bg-indigo-500',
    accentClass: 'from-indigo-500 to-blue-600',
    topColorClass: 'bg-indigo-900',
  },
  FINISHED: {
    label: 'Đã kết thúc',
    badgeClass: 'text-slate-500 bg-slate-50 border-slate-200',
    dotClass: 'bg-slate-400',
    accentClass: 'from-slate-400 to-slate-500',
    topColorClass: 'bg-slate-300',
  },
};
