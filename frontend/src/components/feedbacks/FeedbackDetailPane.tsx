import { useRef, useEffect } from 'react';
import { Reply, Loader2, Trash2 } from 'lucide-react';
import { type Feedback } from '@/types/feedback';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATUS_LABELS } from '@/types/feedback';
import { FeedbackReplyBox } from './FeedbackReplyBox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFeedbackMessages } from '@/hooks/queries/useFeedbackMessages';
import { useUpdateFeedbackStatus } from '@/hooks/mutations/useUpdateFeedbackStatus';
import { useDeleteFeedback } from '@/hooks/mutations/useDeleteFeedback';
import type { FeedbackStatus } from '@/types/feedback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DetailPaneProps {
  feedback: Feedback | null;
  onDeleted?: () => void;
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
          isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        }`}
      >
        {senderName.slice(0, 2).toUpperCase()}
      </div>
      <div className={`flex flex-col max-w-[75%] ${isAdmin ? 'items-end' : 'items-start'}`}>
        <span className="text-[11px] font-semibold text-muted-foreground mb-1">{senderName}</span>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isAdmin
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-card border border-border text-foreground rounded-bl-sm shadow-sm'
          }`}
        >
          <p className="whitespace-pre-wrap">{content}</p>
          <p className={`text-[10px] mt-1 ${isAdmin ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            {time}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FeedbackDetailPane({ feedback, onDeleted }: DetailPaneProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: messages, isLoading: messagesLoading } = useFeedbackMessages(
    feedback?.feedback_id ?? null,
  );
  const { mutate: updateStatus, isPending: statusPending } = useUpdateFeedbackStatus();
  const { mutate: deleteFeedback, isPending: deletePending } = useDeleteFeedback();

  useEffect(() => {
    if (!messagesLoading && messages && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);
    }
  }, [messages, messagesLoading, feedback?.feedback_id]);

  if (!feedback) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20 p-8 sm:p-12">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <Reply className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Chưa chọn hộp thư</h3>
          <p className="text-muted-foreground text-sm mt-2">
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
      <div className="px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-foreground leading-snug truncate">
              {feedback.title}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {FEEDBACK_CATEGORY_LABELS[feedback.category]}
              </span>
              {feedback.student && (
                <span className="text-xs text-muted-foreground/80">
                  · SV: {feedback.student.full_name} ({feedback.student.student_code})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={deletePending}
                  className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  title="Xóa phản hồi"
                >
                  {deletePending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa phản hồi</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc muốn xóa phản hồi <strong>&ldquo;{feedback.title}&rdquo;</strong>?
                    Hành động này không thể hoàn tác và toàn bộ lịch sử tin nhắn sẽ bị mất.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() =>
                      deleteFeedback(feedback.feedback_id, { onSuccess: () => onDeleted?.() })
                    }
                  >
                    Xóa phản hồi
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-foreground">
              {feedback.parent?.full_name?.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-sm font-bold text-foreground">
              {feedback.parent?.full_name}
            </span>
            <span className="text-xs text-muted-foreground ml-2">{feedback.parent?.phone}</span>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
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

      <ScrollArea className="flex-1 bg-muted/10">
        <div className="p-6 flex flex-col gap-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
            <p className="text-center text-sm text-muted-foreground py-8">
              Chưa có tin nhắn nào.
            </p>
          )}
          <div ref={messagesEndRef} className="h-px" />
        </div>
      </ScrollArea>

      <FeedbackReplyBox
        feedbackId={feedback.feedback_id}
        isResolved={feedback.status === 'RESOLVED'}
      />
    </div>
  );
}
