import { ListFilter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Feedback, FeedbackStatus } from '@/types/feedback';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATUS_LABELS } from '@/types/feedback';

interface SidebarProps {
  feedbacks: Feedback[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  statusFilter: FeedbackStatus | 'ALL';
  onStatusFilterChange: (v: FeedbackStatus | 'ALL') => void;
  isLoading: boolean;
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const styles: Record<FeedbackStatus, string> = {
    OPEN: 'bg-amber-50 text-amber-700',
    IN_PROGRESS: 'bg-blue-50 text-blue-700',
    RESOLVED: 'bg-green-50 text-green-700',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${styles[status]}`}>
      {FEEDBACK_STATUS_LABELS[status]}
    </span>
  );
}

export function FeedbackListSidebar({
  feedbacks,
  selectedId,
  onSelect,
  statusFilter,
  onStatusFilterChange,
  isLoading,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-card border-r border-border w-full shrink-0">
      {/* Filter bar */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => onStatusFilterChange(v as FeedbackStatus | 'ALL')}
          >
            <SelectTrigger className="w-[180px] h-9 bg-transparent border-border text-sm font-semibold text-foreground">
              <SelectValue placeholder="Tất cả phản hồi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phản hồi</SelectItem>
              <SelectItem value="OPEN">Chờ xử lý</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
              <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
            </SelectContent>
          </Select>
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
            <ListFilter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 border-b border-border">
                <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-48 bg-muted/50 rounded animate-pulse mb-2" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm font-medium">Không có phản hồi nào</p>
          </div>
        ) : (
          feedbacks.map((fb) => {
            const isActive = fb.feedback_id === selectedId;
            const latestMsg = fb.messages?.[0];

            return (
              <div
                key={fb.feedback_id}
                onClick={() => onSelect(fb.feedback_id)}
                className={`p-4 border-b border-border cursor-pointer transition-colors ${
                  isActive ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold text-sm ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
                    {fb.parent?.full_name ?? '—'}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium shrink-0 ml-2">
                    {new Date(fb.updated_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground font-medium mb-1 truncate">
                  {FEEDBACK_CATEGORY_LABELS[fb.category]}
                  {fb.student && ` · ${fb.student.full_name}`}
                </p>

                <p className={`text-sm font-bold mb-1 truncate ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
                  {fb.title}
                </p>

                {latestMsg && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-1 mb-2">
                    {latestMsg.content}
                  </p>
                )}

                <StatusBadge status={fb.status} />
              </div>
            );
          })
        )}
      </ScrollArea>
    </div>
  );
}
