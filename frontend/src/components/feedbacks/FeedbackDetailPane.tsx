import { Reply, Loader2 } from 'lucide-react';
import { type Feedback } from '@/types/feedback';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATUS_LABELS } from '@/types/feedback';
import { FeedbackReplyBox } from './FeedbackReplyBox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFeedbackMessages } from '@/hooks/queries/useFeedbackMessages';
import { useUpdateFeedbackStatus } from '@/hooks/mutations/useUpdateFeedbackStatus';
import type { FeedbackStatus } from '@/types/feedback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DetailPaneProps {
  feedback: Feedback | null;
}

function MessageBubble({
  content,
  senderRole,
  senderName,
  time,
}: {
  content: string;
  senderRole: 'PARENT' | 'ADMIN';
  senderName: string;
  time: string;
}) {
  const isAdmin = senderRole === 'ADMIN';
  return (
    <div className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
          isAdmin ? 'bg-[#0b203c] text-white' : 'bg-slate-200 text-slate-600'
        }`}
      >
        {senderName.slice(0, 2).toUpperCase()}
      </div>
      <div className={`flex flex-col max-w-[75%] ${isAdmin ? 'items-end' : 'items-start'}`}>
        <span className="text-[11px] font-semibold text-slate-500 mb-1">{senderName}</span>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isAdmin
              ? 'bg-[#0b203c] text-white rounded-br-sm'
              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
          }`}
        >
          <p className="whitespace-pre-wrap">{content}</p>
          <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white/60' : 'text-slate-400'}`}>
            {time}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FeedbackDetailPane({ feedback }: DetailPaneProps) {
  const { data: messages, isLoading: messagesLoading } = useFeedbackMessages(
    feedback?.feedback_id ?? null,
  );
  const { mutate: updateStatus, isPending: statusPending } = useUpdateFeedbackStatus();

  if (!feedback) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/50 p-8 sm:p-12">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Reply className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Chưa chọn hộp thư</h3>
          <p className="text-slate-500 text-sm mt-2">
            Hãy chọn một mục phản hồi từ phía bên trái để bắt đầu xem chi tiết
          </p>
        </div>
      </div>
    );
  }

  const statusColors: Record<FeedbackStatus, string> = {
    OPEN: 'text-amber-700 bg-amber-50 border-amber-200',
    IN_PROGRESS: 'text-blue-700 bg-blue-50 border-blue-200',
    RESOLVED: 'text-green-700 bg-green-50 border-green-200',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-slate-900 leading-snug truncate">
              {feedback.title}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-500">
                {FEEDBACK_CATEGORY_LABELS[feedback.category]}
              </span>
              {feedback.student && (
                <span className="text-xs text-slate-400">
                  · SV: {feedback.student.full_name} ({feedback.student.student_code})
                </span>
              )}
            </div>
          </div>

          {/* Status Selector */}
          <Select
            value={feedback.status}
            onValueChange={(v) =>
              updateStatus({ id: feedback.feedback_id, status: v as FeedbackStatus })
            }
            disabled={statusPending}
          >
            <SelectTrigger
              className={`h-8 w-36 text-xs font-bold border rounded-full px-3 ${statusColors[feedback.status]}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN" className="text-amber-700 font-semibold text-xs">
                {FEEDBACK_STATUS_LABELS.OPEN}
              </SelectItem>
              <SelectItem value="IN_PROGRESS" className="text-blue-700 font-semibold text-xs">
                {FEEDBACK_STATUS_LABELS.IN_PROGRESS}
              </SelectItem>
              <SelectItem value="RESOLVED" className="text-green-700 font-semibold text-xs">
                {FEEDBACK_STATUS_LABELS.RESOLVED}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sender info */}
        <div className="flex items-center gap-3 mt-3">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-slate-600">
              {feedback.parent?.full_name?.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800">
              {feedback.parent?.full_name}
            </span>
            <span className="text-xs text-slate-400 ml-2">{feedback.parent?.phone}</span>
          </div>
          <span className="ml-auto text-xs text-slate-400">
            {new Date(feedback.created_at).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Thread Messages */}
      <ScrollArea className="flex-1 bg-slate-50/30">
        <div className="p-6 flex flex-col gap-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => (
              <MessageBubble
                key={msg.message_id}
                content={msg.content}
                senderRole={msg.sender_role}
                senderName={
                  msg.sender_role === 'PARENT'
                    ? (feedback.parent?.full_name ?? 'Phụ huynh')
                    : 'Ban quản lý'
                }
                time={new Date(msg.created_at).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                })}
              />
            ))
          ) : (
            <p className="text-center text-sm text-slate-400 py-8">
              Chưa có tin nhắn nào.
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Reply Box */}
      <FeedbackReplyBox
        feedbackId={feedback.feedback_id}
        isResolved={feedback.status === 'RESOLVED'}
      />
    </div>
  );
}
