'use client';

import { useState } from 'react';
import { BarChart2, X, Clock, CheckCircle2, MessageSquare, Users, Download, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { useFeedbackAnalytics } from '@/hooks/queries/useFeedbackAnalytics';
import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from '@/types/feedback';
import { exportFeedbackToExcel } from '@/lib/exportFeedback';

const CATEGORY_COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
];

const trendChartConfig = {
  total: { label: 'Tổng phản hồi', color: '#3b82f6' },
  resolved: { label: 'Đã giải quyết', color: '#10b981' },
} satisfies ChartConfig;

function MiniStat({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}


interface FeedbackAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  activeFilters: { status?: string; category?: string; search?: string };
}

export function FeedbackAnalyticsModal({ open, onClose, activeFilters }: FeedbackAnalyticsModalProps) {
  const { data: analytics, isLoading } = useFeedbackAnalytics();
  const [exporting, setExporting] = useState(false);

  const categoryData = (analytics?.categoryBreakdown ?? []).map((item) => ({
    name: FEEDBACK_CATEGORY_LABELS[item.category as FeedbackCategory] ?? item.category,
    value: item.count,
    shortName: (FEEDBACK_CATEGORY_LABELS[item.category as FeedbackCategory] ?? item.category)
      .split(' ')[0],
  }));
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0 [&>button:last-child]:hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Thống kê & Phân tích</DialogTitle>
                <p className="text-xs text-muted-foreground">Dữ liệu 6 tháng gần nhất</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-semibold"
                disabled={exporting}
                              onClick={async () => {
                  setExporting(true);
                  try {
                    await exportFeedbackToExcel(activeFilters);
                  } finally {
                    setExporting(false);
                  }
                }}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Xuất Excel
              </Button>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat
                  icon={MessageSquare}
                  label="Tổng phản hồi (6 tháng)"
                  value={analytics?.totalInPeriod ?? 0}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                />
                <MiniStat
                  icon={CheckCircle2}
                  label="Tỷ lệ giải quyết"
                  value={`${analytics?.resolutionRate ?? 0}%`}
                  sub="trong 6 tháng gần nhất"
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                />
                <MiniStat
                  icon={Clock}
                  label="Thời gian phản hồi TB"
                  value={
                    analytics?.avgResponseHours !== null && analytics?.avgResponseHours !== undefined
                      ? analytics.avgResponseHours < 1
                        ? `${Math.round(analytics.avgResponseHours * 60)} phút`
                        : `${analytics.avgResponseHours} giờ`
                      : '—'
                  }
                  sub="lần phản hồi đầu tiên"
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                />
                <MiniStat
                  icon={Users}
                  label="Đã được phản hồi"
                  value={analytics?.respondedCount ?? 0}
                  sub={`/ ${analytics?.totalInPeriod ?? 0} tổng cộng`}
                  iconBg="bg-purple-50"
                  iconColor="text-purple-600"
                />
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-1">Xu hướng phản hồi theo tháng</h3>
                <p className="text-xs text-muted-foreground mb-4">Tổng số phản hồi và đã giải quyết</p>
                {(analytics?.trend?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
                ) : (
                  <ChartContainer config={trendChartConfig} className="h-[220px] w-full">
                    <BarChart
                      data={analytics!.trend}
                      margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                      barGap={4}
                      barSize={24}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        className="text-xs text-muted-foreground"
                      />
                      <YAxis tickLine={false} axisLine={false} className="text-xs text-muted-foreground" allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" fill="var(--color-resolved)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-bold text-foreground mb-1">Phân bổ theo danh mục</h3>
                  <p className="text-xs text-muted-foreground mb-3">6 tháng gần nhất</p>
                  {categoryData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
                  ) : (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width={140} height={140}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={65}
                            paddingAngle={2}
                          >
                            {categoryData.map((_, i) => (
                              <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [value, name]}
                            contentStyle={{
                              fontSize: '11px',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              background: 'var(--card)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        {categoryData.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                            />
                            <span className="truncate text-foreground/80 flex-1">{item.name}</span>
                            <span className="font-bold text-foreground shrink-0">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-bold text-foreground mb-1">Top danh mục</h3>
                  <p className="text-xs text-muted-foreground mb-3">Sắp xếp theo số lượng</p>
                  {categoryData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
                  ) : (
                    <div className="space-y-2.5">
                      {categoryData.slice(0, 6).map((item, i) => {
                        const maxCount = categoryData[0].value;
                        const pct = maxCount > 0 ? Math.round((item.value / maxCount) * 100) : 0;
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-foreground/80 truncate flex-1 pr-2">{item.name}</span>
                              <span className="font-bold text-foreground shrink-0">{item.value}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
