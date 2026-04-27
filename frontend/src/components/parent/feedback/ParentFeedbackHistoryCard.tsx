'use client';

import { useState } from 'react';
import {
  Clock,
  MessageSquareText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { useMyFeedbacks } from '@/hooks/queries/useMyFeedbacks';
import type { Feedback, FeedbackStatus } from '@/types/feedback';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATUS_LABELS } from '@/types/feedback';

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const styles: Record<FeedbackStatus, string> = {
    OPEN: 'bg-amber-50 text-amber-700 border-amber-100',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-100',
    RESOLVED: 'bg-green-50 text-green-700 border-green-100',
  };
  const dots: Record<FeedbackStatus, string> = {
    OPEN: 'bg-amber-500',
    IN_PROGRESS: 'bg-blue-500',
    RESOLVED: 'bg-green-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {FEEDBACK_STATUS_LABELS[status]}
    </span>
  );
}

function FeedbackHistoryItem({
  item,
  onViewThread,
}: {
  item: Feedback;
  onViewThread: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const latestMessage = item.messages?.[0];
  const hasReply = item.messages && item.messages.length > 1;

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800 truncate">
              {item.title}
            </span>
            <StatusBadge status={item.status} />
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {FEEDBACK_CATEGORY_LABELS[item.category]}
          </p>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3" />
            {new Date(item.created_at).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>
        <span className="shrink-0 text-slate-400 mt-0.5">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50">
          <div className="pt-3">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Nội dung đã gửi:
            </p>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line line-clamp-4">
              {item.content}
            </p>
          </div>

          {hasReply && latestMessage && (
            <div className="bg-[#0b203c]/5 border border-[#0b203c]/10 rounded-lg p-3">
              <p className="text-xs font-bold text-[#0b203c] mb-1">
                Nhà trường đã phản hồi
              </p>
              <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                {latestMessage.content}
              </p>
            </div>
          )}

          <button
            onClick={() => onViewThread(item.feedback_id)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0b203c] hover:underline self-start"
          >
            Xem toàn bộ cuộc trò chuyện
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

interface Props {
  onViewThread: (feedbackId: number) => void;
}

export function ParentFeedbackHistoryCard({ onViewThread }: Props) {
  const { data: feedbacks, isLoading } = useMyFeedbacks();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquareText className="h-4 w-4 text-slate-400" />
          <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!feedbacks || feedbacks.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquareText className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-900">Lịch sử phản hồi</h3>
        <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {feedbacks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {feedbacks.map((fb) => (
          <FeedbackHistoryItem key={fb.feedback_id} item={fb} onViewThread={onViewThread} />
        ))}
      </div>
    </div>
  );
}
