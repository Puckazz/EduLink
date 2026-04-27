'use client';

import { useRef, useEffect, useState } from 'react';
import { ArrowLeft, SendHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFeedbackMessages } from '@/hooks/queries/useFeedbackMessages';
import { useSendMessage } from '@/hooks/mutations/useSendMessage';
import type { Feedback, FeedbackMessage } from '@/types/feedback';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATUS_LABELS } from '@/types/feedback';

function MessageBubble({ msg }: { msg: FeedbackMessage }) {
  const isParent = msg.sender_role === 'PARENT';
  return (
    <div className={`flex ${isParent ? 'justify-end' : 'justify-start'}`}>
      {!isParent && (
        <div className="h-7 w-7 rounded-full bg-[#0b203c] flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-2 mt-1">
          BM
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isParent
            ? 'bg-[#0b203c] text-white rounded-br-sm'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <p
          className={`text-[10px] mt-1 ${isParent ? 'text-white/60 text-right' : 'text-slate-400'}`}
        >
          {new Date(msg.created_at).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

interface Props {
  feedback: Feedback;
  onBack: () => void;
}

export function ParentFeedbackThread({ feedback, onBack }: Props) {
  const [replyText, setReplyText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useFeedbackMessages(feedback.feedback_id);
  const { mutate: sendMessage, isPending } = useSendMessage();

  // Auto-scroll to bottom when messages load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const statusColors = {
    OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    RESOLVED: 'bg-green-50 text-green-700 border-green-200',
  };

  function handleSend() {
    if (!replyText.trim() || isPending) return;
    sendMessage(
      { feedbackId: feedback.feedback_id, content: replyText.trim(), role: 'parent' },
      { onSuccess: () => setReplyText('') },
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Thread Header */}
      <div className="flex items-start gap-3 p-4 border-b border-slate-100 bg-slate-50/60">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 shrink-0 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 truncate">{feedback.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[11px] text-slate-500">
              {FEEDBACK_CATEGORY_LABELS[feedback.category]}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[feedback.status]}`}
            >
              {FEEDBACK_STATUS_LABELS[feedback.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 h-[320px]">
        <div className="p-4 flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : messages && messages.length > 0 ? (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.message_id} msg={msg} />
              ))}
            </>
          ) : (
            <p className="text-center text-sm text-slate-400 py-8">
              Chưa có tin nhắn nào.
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Reply Box */}
      {feedback.status !== 'RESOLVED' && (
        <div className="border-t border-slate-100 p-4 flex gap-3 items-end bg-white">
          <Textarea
            placeholder="Nhập thêm thông tin... (Ctrl+Enter để gửi)"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="resize-none border-slate-200 text-sm focus-visible:ring-[#0b203c]/20 flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!replyText.trim() || isPending}
            className="h-10 w-10 p-0 bg-[#0b203c] hover:bg-[#142d52] rounded-xl shrink-0 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {feedback.status === 'RESOLVED' && (
        <div className="border-t border-slate-100 p-3 bg-green-50 text-center">
          <p className="text-xs text-green-700 font-semibold">
            Phản hồi này đã được giải quyết
          </p>
        </div>
      )}
    </div>
  );
}
