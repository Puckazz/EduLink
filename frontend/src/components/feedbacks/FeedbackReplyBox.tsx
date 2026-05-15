'use client';

import { useState } from 'react';
import { SendHorizontal, Loader2, Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSendMessage } from '@/hooks/mutations/useSendMessage';
import { AiService } from '@/services/ai.service';

interface Props {
  feedbackId: number;
  isResolved: boolean;
}

export function FeedbackReplyBox({ feedbackId, isResolved }: Props) {
  const [content, setContent] = useState('');
  const { mutate: sendMessage, isPending } = useSendMessage();
  const suggestReplyMutation = useMutation({
    mutationFn: () => AiService.suggestFeedbackReply(feedbackId),
    onSuccess: (draft) => {
      setContent(draft.content);
      toast.success('Đã tạo gợi ý trả lời bằng AI');
    },
    onError: () => {
      toast.error('Không thể tạo gợi ý AI. Nội dung hiện tại vẫn được giữ nguyên.');
    },
  });

  function handleSend() {
    if (!content.trim() || isPending) return;
    sendMessage(
      { feedbackId, content: content.trim(), role: 'admin' },
      { onSuccess: () => setContent('') },
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  if (isResolved) {
    return (
      <div className="shrink-0 px-6 py-3 border-t border-border bg-emerald-500/10 text-center">
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Phản hồi này đã được đánh dấu là giải quyết xong
        </p>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-border bg-card px-6 py-4">
      <div className="flex gap-3 items-start">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border">
          <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
            <span className="font-bold text-xs">BM</span>
          </div>
        </div>

        <div className="flex-1 border border-border rounded-xl bg-card overflow-hidden focus-within:ring-1 focus-within:ring-ring transition-shadow">
          <Textarea
            placeholder="Nhập nội dung trả lời tại đây... (Ctrl+Enter để gửi)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-4 text-sm font-medium placeholder:text-muted-foreground"
          />

          <div className="flex flex-wrap items-center justify-between p-3 border-t border-border bg-card gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => suggestReplyMutation.mutate()}
              disabled={suggestReplyMutation.isPending || isPending}
              className="font-bold gap-2"
            >
              {suggestReplyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {suggestReplyMutation.isPending ? 'Đang gợi ý...' : 'Gợi ý AI'}
            </Button>

            <Button
              onClick={handleSend}
              disabled={!content.trim() || isPending}
              className="font-bold gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  Gửi phản hồi
                  <SendHorizontal className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
