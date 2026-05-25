'use client';

import { useState } from 'react';
import {
  Clock,
  MessageSquareText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MessageCircleReply,
} from 'lucide-react';
import { useMyFeedbacks } from '@/hooks/queries/useMyFeedbacks';
import type { Feedback, FeedbackStatus } from '@/types/feedback';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATUS_LABELS } from '@/types/feedback';

const COLLAPSED_LIMIT = 3;

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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {FEEDBACK_STATUS_LABELS[status]}
    </span>
  );
}

function FeedbackHistoryRow({
  item,
  onViewThread,
}: {
  item: Feedback;
  onViewThread: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const latestMessage = item.messages?.[0];
  const hasReply = item.messages && item.messages.length > 0;

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden bg-white hover:border-slate-200 transition-colors">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {item.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {FEEDBACK_CATEGORY_LABELS[item.category]}
          </p>
        </div>

        <StatusBadge status={item.status} />

        {hasReply && (
          <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
            <MessageCircleReply className="h-3 w-3" />
            Đã phản hồi
          </span>
        )}

        <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
          <Clock className="h-3.5 w-3.5" />
          {new Date(item.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>

        <span className="shrink-0 text-slate-400">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-4 border-t border-slate-100 bg-slate-50/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Nội dung đã gửi
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line line-clamp-5">
                {item.content}
              </p>
            </div>

            {hasReply && latestMessage ? (
              <div className="bg-[#0b203c]/5 border border-[#0b203c]/10 rounded-xl p-4">
                <p className="text-xs font-bold text-[#0b203c] mb-1.5 uppercase tracking-wide">
                  Phản hồi từ nhà trường
                </p>
                <p className="text-sm text-slate-700 leading-relaxed line-clamp-5">
                  {latestMessage.content}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-400 italic">
                  Chưa có phản hồi từ nhà trường
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 sm:hidden flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(item.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
            <button
              onClick={() => onViewThread(item.feedback_id)}
              className="flex items-center gap-1.5 text-sm font-bold text-[#0b203c] hover:underline ml-auto"
            >
              Xem cuộc trò chuyện
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
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
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquareText className="h-4 w-4 text-slate-400" />
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!feedbacks || feedbacks.length === 0) return null;

  const hasMore = feedbacks.length > COLLAPSED_LIMIT;
  const visibleItems = showAll ? feedbacks : feedbacks.slice(0, COLLAPSED_LIMIT);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquareText className="h-5 w-5 text-slate-500" />
        <h3 className="text-base font-bold text-slate-900">Lịch sử phản hồi</h3>
        <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {feedbacks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {visibleItems.map((fb) => (
          <FeedbackHistoryRow key={fb.feedback_id} item={fb} onViewThread={onViewThread} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 border border-slate-100 transition-all duration-200"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Thu gọn
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Xem thêm {feedbacks.length - COLLAPSED_LIMIT} phản hồi khác
            </>
          )}
        </button>
      )}
    </div>
  );
}
