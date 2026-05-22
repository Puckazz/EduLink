import { History } from 'lucide-react';
import { type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ScoreLogEntry } from '@/types/score';

interface ScoreLogsCardProps {
  logs: ScoreLogEntry[];
  variant?: 'card' | 'plain';
  maxHeightClassName?: string;
}

function formatActionLabel(action: string): string {
  if (action === 'MANUAL_EDIT') {
    return 'Chỉnh sửa tay';
  }

  if (action === 'BULK_IMPORT') {
    return 'Nhập Excel';
  }

  if (action === 'PUBLISH') {
    return 'Công bố';
  }

  return 'Hủy công bố';
}

export function ScoreLogsCard({ logs }: ScoreLogsCardProps) {
  return renderLogsContent({ logs, variant: 'card' });
}

function renderLogsContent({
  logs,
  variant,
  maxHeightClassName,
}: Required<Pick<ScoreLogsCardProps, 'logs'>> &
  Pick<ScoreLogsCardProps, 'variant' | 'maxHeightClassName'>): ReactNode {
  const scrollClassName = cn(variant !== 'plain' && 'pr-2', maxHeightClassName ?? 'h-64');

  const innerContent = (
    <div className={cn(variant === 'plain' && "p-6")}>
      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có thay đổi nào được ghi nhận.
        </p>
      ) : (
      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.log_id}
            className="rounded-md border border-border bg-background px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                {formatActionLabel(log.action)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(log.created_at).toLocaleString('vi-VN')}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{log.actor}</p>
            <p className="mt-1 text-sm text-foreground">{log.description}</p>
            {log.student_code ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {log.student_name} ({log.student_code})
              </p>
            ) : null}
          </div>
        ))}
      </div>
      )}
    </div>
  );

  if (variant === 'plain') {
    return innerContent;
  }

  const content = (
    <ScrollArea className={scrollClassName}>
      {innerContent}
    </ScrollArea>
  );

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <History className="h-4 w-4" />
          Nhật ký chỉnh sửa
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

export function ScoreLogsPanel({
  logs,
  maxHeightClassName,
}: {
  logs: ScoreLogEntry[];
  maxHeightClassName?: string;
}) {
  return renderLogsContent({ logs, variant: 'plain', maxHeightClassName });
}
