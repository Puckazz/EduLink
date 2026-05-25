import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import type { Attendance } from '@/types/attendance';

const chartConfig: ChartConfig = {
  rate: { label: 'Tỷ lệ có mặt (%)' },
};

function barColor(rate: number) {
  if (rate >= 80) return '#10b981';
  if (rate >= 65) return '#f59e0b';
  return '#ef4444';
}

interface ParentAttendanceBarChartProps {
  records: Attendance[];
  loading?: boolean;
}

export function ParentAttendanceBarChart({
  records,
  loading = false,
}: ParentAttendanceBarChartProps) {
  const data = useMemo(() => {
    return [...records]
      .sort(
        (a, b) =>
          new Date(a.term.start_date).getTime() - new Date(b.term.start_date).getTime() ||
          a.term.code.localeCompare(b.term.code),
      )
      .map((att) => {
        const late    = att.late_sessions;
        const present = Math.max(0, att.total_sessions - att.absent_sessions - late);
        const rate    =
          att.total_sessions > 0
            ? Math.round(((present + late) / att.total_sessions) * 100)
            : 0;
        return {
          termName: att.term.name,
          label: att.term.name,
          shortLabel: att.term.code,
          academicYear: att.term.academic_year.name,
          rate,
        };
      });
  }, [records]);

  if (loading) return <Skeleton className="h-[220px] w-full rounded-2xl" />;

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-2xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="mb-1 text-base font-bold text-foreground">Xu Hướng Theo Học Kỳ</h3>
        <p className="text-sm text-muted-foreground">Tỷ lệ chuyên cần từng học kỳ</p>
      </div>

      <ChartContainer config={chartConfig} className="h-[160px] w-full">
        <BarChart data={data} margin={{ top: 20, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.06} />
          <XAxis
            dataKey="shortLabel"
            tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <ReferenceLine
            y={80}
            stroke="#ef4444"
            strokeDasharray="4 3"
            strokeOpacity={0.5}
            strokeWidth={1.5}
            label={{ value: '80%', position: 'insideTopRight', fontSize: 11, fill: '#ef4444', opacity: 0.7 }}
          />
          <ChartTooltip
            cursor={{ fill: 'currentColor', fillOpacity: 0.04 }}
            content={
              <ChartTooltipContent
                formatter={(value) => [`${value}%`, 'Tỷ lệ']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.termName ?? ''}
              />
            }
          />
          <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={52}>
            {data.map((entry, i) => (
              <Cell key={i} fill={barColor(entry.rate)} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="mt-auto pt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {[['#10b981', '≥ 80% — Tốt'], ['#f59e0b', '65–79% — Cảnh báo'], ['#ef4444', '< 65% — Nguy hiểm']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
