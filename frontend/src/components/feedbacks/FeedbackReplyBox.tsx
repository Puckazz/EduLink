'use client';

import { useState } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSendMessage } from '@/hooks/mutations/useSendMessage';

interface Props {
  feedbackId: number;
  isResolved: boolean;
}

export function FeedbackReplyBox({ feedbackId, isResolved }: Props) {
  const [content, setContent] = useState('');
  const { mutate: sendMessage, isPending } = useSendMessage();

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
      <div className="shrink-0 px-6 py-3 border-t border-slate-200 bg-green-50 text-center">
        <p className="text-xs font-semibold text-green-700">
          Phản hồi này đã được đánh dấu là giải quyết xong
        </p>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
      <div className="flex gap-3 items-start">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200">
          <div className="flex h-full w-full items-center justify-center bg-[#0b203c] text-white">
            <span className="font-bold text-xs">BM</span>
          </div>
        </div>

        <div className="flex-1 border border-slate-200 rounded-xl bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#0b203c]/20 transition-shadow">
          <Textarea
            placeholder="Nhập nội dung trả lời tại đây... (Ctrl+Enter để gửi)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-4 text-sm font-medium placeholder:text-slate-400"
          />

          <div className="flex items-center justify-end p-3 border-t border-slate-100 bg-white gap-3">
            <Button
              onClick={handleSend}
              disabled={!content.trim() || isPending}
              className="font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm gap-2 disabled:opacity-50"
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
