'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AiService } from '@/services/ai.service';
import {
  type FeedbackCategory,
  type FeedbackStatus,
} from '@/types/feedback';

interface AiFeedbackSummaryBannerProps {
  status?: FeedbackStatus | 'ALL';
  category?: FeedbackCategory | 'ALL';
  search?: string;
}

export function AiFeedbackSummaryBanner({
  status,
  category,
  search,
}: AiFeedbackSummaryBannerProps) {
  const query = useQuery({
    queryKey: ['ai', 'feedback-summary', status, category, search],
    queryFn: () =>
      AiService.getFeedbackSummary({
        status: status !== 'ALL' ? status : undefined,
        category: category !== 'ALL' ? category : undefined,
        search: search || undefined,
      }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const data = query.data;

  return (
    <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                AI Summary phản hồi
              </h2>
              {query.isLoading && (
                <Badge variant="secondary">Đang phân tích...</Badge>
              )}
              {data && data.urgentCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {data.urgentCount} khẩn cấp
                </Badge>
              )}
              {data && data.totalMatched > 0 && (
                <Badge variant="outline" className="bg-background/70">
                  Mẫu {data.sampleSize}/{data.totalMatched}
                </Badge>
              )}
            </div>

            {query.isError ? (
              <p className="text-sm text-destructive">
                Không thể tải tóm tắt AI. Kiểm tra cấu hình AI hoặc thử lại sau.
              </p>
            ) : (
              <p className="max-w-4xl text-sm leading-relaxed text-foreground/85">
                {data?.summary ??
                  'AI đang tóm tắt các phản hồi OPEN/IN_PROGRESS theo bộ lọc hiện tại.'}
              </p>
            )}

            {data && data.suggestedActions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.suggestedActions.map((action) => (
                  <Badge
                    key={action}
                    variant="outline"
                    className="bg-background/70 font-medium"
                  >
                    {action}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2 bg-background/70 font-semibold"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            <RefreshCw
              className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`}
            />
            Làm mới AI
          </Button>
        </div>
      </div>
    </section>
  );
}
