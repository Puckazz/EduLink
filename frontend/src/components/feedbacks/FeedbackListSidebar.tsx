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
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full shrink-0">
      {/* Filter bar */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => onStatusFilterChange(v as FeedbackStatus | 'ALL')}
          >
            <SelectTrigger className="w-[180px] h-9 bg-transparent border-slate-200 text-sm font-semibold text-slate-700">
              <SelectValue placeholder="Tất cả phản hồi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phản hồi</SelectItem>
              <SelectItem value="OPEN">Chờ xử lý</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
              <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
            </SelectContent>
          </Select>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <ListFilter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 border-b border-slate-100">
                <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-48 bg-slate-50 rounded animate-pulse mb-2" />
                <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
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
                className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                  isActive ? 'bg-slate-100/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold text-sm ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                    {fb.parent?.full_name ?? '—'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium shrink-0 ml-2">
                    {new Date(fb.updated_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium mb-1 truncate">
                  {FEEDBACK_CATEGORY_LABELS[fb.category]}
                  {fb.student && ` · ${fb.student.full_name}`}
                </p>

                <p className={`text-sm font-bold mb-1 truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                  {fb.title}
                </p>

                {latestMsg && (
                  <p className="text-xs text-slate-400 line-clamp-1 mb-2">
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
