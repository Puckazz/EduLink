'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import type { ChatHistoryItem } from '@/types/ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useMemo, useState } from 'react';

interface ChatMessageProps {
  item: ChatHistoryItem;
}

export function ChatMessage({ item }: ChatMessageProps) {
  const isUser = item.role === 'USER';
  const shouldAnimateAiReply = useMemo(() => {
    if (isUser || !item.content.trim()) return false;

    const createdAt = new Date(item.created_at).getTime();
    if (Number.isNaN(createdAt)) return false;

    return Date.now() - createdAt < 20_000;
  }, [isUser, item.content, item.created_at]);
  const [visibleContent, setVisibleContent] = useState(
    shouldAnimateAiReply ? '' : item.content,
  );

  useEffect(() => {
    if (!shouldAnimateAiReply) {
      setVisibleContent(item.content);
      return;
    }

    setVisibleContent('');

    let index = 0;
    const step = Math.max(2, Math.ceil(item.content.length / 90));
    const typingTimer = window.setInterval(() => {
      index = Math.min(item.content.length, index + step);
      setVisibleContent(item.content.slice(0, index));

      if (index >= item.content.length) {
        window.clearInterval(typingTimer);
      }
    }, 18);

    return () => {
      window.clearInterval(typingTimer);
    };
  }, [item.content, shouldAnimateAiReply]);

  const displayedContent = isUser ? item.content : visibleContent;

  return (
    <div
      className={cn(
        'flex max-w-[85%] gap-3',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto',
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-xs',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'border border-primary/15 bg-primary/10 text-primary',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          'min-w-0 rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-md'
            : 'rounded-tl-md border border-border/70 bg-card text-foreground',
          shouldAnimateAiReply && 'animate-[chatAnswerReveal_0.24s_ease-out]',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap wrap-break-word">{displayedContent}</p>
        ) : (
          <div className="markdown-body text-sm text-foreground wrap-break-word">
            <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
              {displayedContent}
            </ReactMarkdown>
          </div>
        )}
        <p
          className={cn(
            'mt-1 text-[10px]',
            isUser
              ? 'text-primary-foreground/60 text-right'
              : 'text-muted-foreground',
          )}
        >
          {new Date(item.created_at).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="mr-auto flex max-w-[85%] gap-3" aria-live="polite">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-primary shadow-xs">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-tl-md border border-border/70 bg-card px-4 py-3 shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/50" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/50 [animation-delay:0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/50 [animation-delay:0.3s]" />
        </div>
      </div>
    </div>
  );
}
