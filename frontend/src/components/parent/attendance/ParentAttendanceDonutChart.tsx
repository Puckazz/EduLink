import { Cell, Pie, PieChart } from 'recharts';
import {
  ChartContainer,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig: ChartConfig = {
  present: { label: 'Có mặt',   color: '#10b981' },
  late:    { label: 'Đi muộn',  color: '#f59e0b' },
  absent:  { label: 'Vắng mặt', color: '#ef4444' },
};

interface ParentAttendanceDonutChartProps {
  present: number;
  late: number;
  absent: number;
  total: number;
  loading?: boolean;
}

export function ParentAttendanceDonutChart({
  present,
  late,
  absent,
  total,
  loading = false,
}: ParentAttendanceDonutChartProps) {
  if (loading) return <Skeleton className="h-[220px] w-full rounded-2xl" />;

  const rate =
    total > 0 ? Math.round(((present + late) / total) * 100) : null;

  const pieData =
    total === 0
      ? [{ name: 'none', value: 1, color: 'currentColor', opacity: 0.08 }]
      : [
          { name: 'present', value: present, color: '#10b981', opacity: 1 },
          { name: 'late',    value: late,    color: '#f59e0b', opacity: 1 },
          { name: 'absent',  value: absent,  color: '#ef4444', opacity: 1 },
        ];

  const rateColor =
    rate === null ? 'text-muted-foreground'
    : rate >= 80  ? 'text-emerald-600'
    : rate >= 65  ? 'text-amber-500'
    : 'text-red-500';

  const bars = [
    { key: 'present', label: 'Có mặt',   count: present, color: 'bg-emerald-500' },
    { key: 'late',    label: 'Đi muộn',  count: late,    color: 'bg-amber-400'   },
    { key: 'absent',  label: 'Vắng mặt', count: absent,  color: 'bg-red-400'     },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="mb-1 text-base font-bold text-foreground">Phân Bổ Chuyên Cần</h3>
        <p className="text-sm text-muted-foreground">Tổng hợp tất cả học kỳ</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 sm:flex-row">
        {/* Donut */}
        <div className="relative shrink-0">
          <ChartContainer config={chartConfig} className="h-[160px] w-[160px]">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={66}
                dataKey="value"
                strokeWidth={0}
                paddingAngle={total === 0 ? 0 : 2}
              >
                {pieData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color}
                    fillOpacity={entry.opacity}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-black leading-tight ${rateColor}`}>
              {rate !== null ? `${rate}%` : '—'}
            </span>
            <span className="text-xs font-medium text-muted-foreground">có mặt</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-4">
          {bars.map(({ key, label, count, color }) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                    {label}
                  </span>
                  <span className="tabular-nums font-medium text-muted-foreground">
                    {count} buổi · {pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="pt-2 text-sm text-muted-foreground">
            Tổng: <strong className="font-semibold text-foreground">{total}</strong> buổi học
          </p>
        </div>
      </div>
    </div>
  );
}
