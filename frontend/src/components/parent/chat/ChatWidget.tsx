'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
} from '@dnd-kit/core';
import {
  MessageCircle,
  Send,
  X,
  Sparkles,
  Plus,
  Bot,
  History,
  Check,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, ChatMessageSkeleton } from './ChatMessage';
import { useSendChatMessage } from '@/hooks/mutations/useSendChatMessage';
import { useChatHistory } from '@/hooks/queries/useChatHistory';
import { useConversations } from '@/hooks/queries/useConversations';
import { useCreateConversation } from '@/hooks/mutations/useCreateConversation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useStudentStore } from '@/stores/useStudentStore';
import type { ChatHistoryItem } from '@/types/ai';
import type { ParentProfile } from '@/types/auth';
import type { AxiosError } from 'axios';
import { useAutoResize } from '@/hooks/useAutoResize';
import { toast } from 'sonner';

const CHAT_WIDGET_HEIGHT = 500;
const CHAT_WIDGET_BOTTOM = 80;
const VIEWPORT_PADDING = 16;
const TRIGGER_EDGE_PADDING = 24;
const TRIGGER_SIZE_FALLBACK = 56;

type OptimisticUserMessage = {
  conversationId: number;
  content: string;
  createdAt: string;
};

const TEMP_CONVERSATION_ID = -1;

type ChatWidgetTriggerProps = {
  children: React.ReactNode;
  coords: { x: number; y: number };
  isOpen: boolean;
  onClick: (event: React.MouseEvent) => void;
  setButtonNode: (node: HTMLButtonElement | null) => void;
};

function ChatWidgetTrigger({
  children,
  coords,
  isOpen,
  onClick,
  setButtonNode,
}: ChatWidgetTriggerProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: 'chat-widget-trigger' });

  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      setNodeRef(node);
      setButtonNode(node);
    },
    [setButtonNode, setNodeRef],
  );

  const bubbleStyle: React.CSSProperties = {
    transform: `translate(${coords.x + (transform?.x ?? 0)}px, ${
      coords.y + (transform?.y ?? 0)
    }px)`,
    transition: isDragging
      ? 'none'
      : 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
    touchAction: 'none',
  };

  return (
    <Button
      ref={setTriggerRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={bubbleStyle}
      size="icon"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg select-none cursor-grab active:cursor-grabbing"
      id="chat-widget-trigger"
      aria-label={isOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
    >
      {children}
    </Button>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [optimisticUserMsg, setOptimisticUserMsg] =
    useState<OptimisticUserMessage | null>(null);

  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const hasMovedRef = useRef(false);
  const [buttonNode, setButtonNode] = useState<HTMLButtonElement | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: profile } = useCurrentUser();
  const parentProfile = profile as ParentProfile | undefined;
  const { selectedStudentId } = useStudentStore();

  const activeStudentId =
    selectedStudentId ?? parentProfile?.students?.[0]?.student_id;

  const { data: conversations = [], isPending: convsLoading } =
    useConversations(activeStudentId);

  const { data: historyData, isPending: historyLoading } =
    useChatHistory(activeConvId ?? undefined);

  const sendMutation = useSendChatMessage();
  const createMutation = useCreateConversation();

  const messages: ChatHistoryItem[] = useMemo(
    () => [...(historyData?.data ?? [])].reverse(),
    [historyData],
  );

  const activeOptimisticUserMsg =
    optimisticUserMsg &&
    (optimisticUserMsg.conversationId === activeConvId ||
      (!activeConvId && optimisticUserMsg.conversationId === TEMP_CONVERSATION_ID))
      ? optimisticUserMsg
      : null;
  const isSendingActiveConversation =
    sendMutation.isPending &&
    sendMutation.variables?.conversationId === activeConvId;
  const isSendErrorForActiveConversation =
    sendMutation.isError &&
    sendMutation.variables?.conversationId === activeConvId;

  const isOptimisticMessagePersisted = useMemo(() => {
    const optimisticContent = activeOptimisticUserMsg?.content.trim();
    if (!optimisticContent) return false;

    return messages.some(
      (item) => item.role === 'USER' && item.content.trim() === optimisticContent,
    );
  }, [messages, activeOptimisticUserMsg]);

  const activeConvTitle = useMemo(
    () => conversations.find((c) => c.conversation_id === activeConvId)?.title ?? '',
    [conversations, activeConvId],
  );

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useAutoResize(inputRef, message, 120);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [
    messages.length,
    activeOptimisticUserMsg,
    isSendingActiveConversation,
    createMutation.isPending,
    scrollToBottom,
  ]);

  useEffect(() => {
    if (!isOptimisticMessagePersisted) return;

    setOptimisticUserMsg(null);
    if (isSendErrorForActiveConversation) {
      sendMutation.reset();
    }
    setTimeout(scrollToBottom, 50);
  }, [
    isOptimisticMessagePersisted,
    isSendErrorForActiveConversation,
    sendMutation,
    scrollToBottom,
  ]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowHistory(false);
    // Do NOT auto-select a conversation — start fresh
  };

  const selectConversation = (id: number) => {
    sendMutation.reset();
    setOptimisticUserMsg(null);
    setActiveConvId(id);
    setShowHistory(false);
    setTimeout(scrollToBottom, 200);
  };

  const handleNewChat = () => {
    if (!activeStudentId || createMutation.isPending) return;
    sendMutation.reset();
    setOptimisticUserMsg(null);
    createMutation.mutate(
      { studentId: activeStudentId },
      {
        onSuccess: (newConv) => {
          setActiveConvId(newConv.conversation_id);
          setShowHistory(false);
          setTimeout(() => inputRef.current?.focus(), 150);
        },
      },
    );
  };

  const handleSend = () => {
    const trimmed = message.trim();
    sendPrompt(trimmed);
  };

  const sendPrompt = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || sendMutation.isPending || createMutation.isPending) return;

    if (!activeConvId && !activeStudentId) {
      toast.error('Chưa có sinh viên để tạo cuộc trò chuyện.');
      return;
    }

    // Clear any previous error so banner disappears on retry
    sendMutation.reset();

    setMessage('');
    setTimeout(scrollToBottom, 50);

    if (activeConvId) {
      setOptimisticUserMsg({
        conversationId: activeConvId,
        content: trimmed,
        createdAt: new Date().toISOString(),
      });
      sendMutation.mutate(
        { message: trimmed, conversationId: activeConvId },
        {
          // On success: real data loads from cache → safe to clear optimistic
          onSuccess: () => {
            setOptimisticUserMsg(null);
            setTimeout(scrollToBottom, 100);
          },
          // On error: KEEP optimistic message visible so user sees what failed
          // Error banner will show below
        },
      );
    } else {
      // No conversation selected → auto-create then send
      if (!activeStudentId) return;
      const createdAt = new Date().toISOString();
      setOptimisticUserMsg({
        conversationId: TEMP_CONVERSATION_ID,
        content: trimmed,
        createdAt,
      });
      createMutation.mutate(
        { studentId: activeStudentId },
        {
          onSuccess: (newConv) => {
            setActiveConvId(newConv.conversation_id);
            setOptimisticUserMsg({
              conversationId: newConv.conversation_id,
              content: trimmed,
              createdAt,
            });
            sendMutation.mutate(
              { message: trimmed, conversationId: newConv.conversation_id },
              {
                onSuccess: () => {
                  setOptimisticUserMsg(null);
                  setTimeout(scrollToBottom, 100);
                },
              },
            );
          },
          onError: () => setOptimisticUserMsg(null),
        },
      );
    }
  };

  const handleSuggestionClick = (q: string) => {
    sendPrompt(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSnappedCoords = useCallback(
    (nextCoords: { x: number; y: number }) => {
      if (typeof window === 'undefined') return nextCoords;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const btnWidth = buttonNode?.offsetWidth ?? TRIGGER_SIZE_FALLBACK;
      const btnHeight = buttonNode?.offsetHeight ?? TRIGGER_SIZE_FALLBACK;
      const padding = TRIGGER_EDGE_PADDING;

      const defaultLeft = screenWidth - padding - btnWidth;
      const currentLeft = defaultLeft + nextCoords.x;
      const centerX = currentLeft + btnWidth / 2;
      const leftDist = centerX;
      const rightDist = screenWidth - centerX;

      let targetX = 0;
      if (leftDist < rightDist) {
        targetX = padding - defaultLeft;
      } else {
        targetX = 0;
      }

      const defaultTop = screenHeight - padding - btnHeight;
      const currentY = nextCoords.y;
      const minY = padding - defaultTop;
      const maxY = 0;
      const targetY = Math.max(minY, Math.min(maxY, currentY));

      return { x: targetX, y: targetY };
    },
    [buttonNode],
  );

  const handleDragMove = (event: DragMoveEvent) => {
    setDragDelta(event.delta);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    hasMovedRef.current = true;
    setDragDelta({ x: 0, y: 0 });
    setCoords((current) =>
      getSnappedCoords({
        x: current.x + event.delta.x,
        y: current.y + event.delta.y,
      }),
    );
    window.setTimeout(() => {
      hasMovedRef.current = false;
    }, 0);
  };

  const handleDragCancel = () => {
    setDragDelta({ x: 0, y: 0 });
    window.setTimeout(() => {
      hasMovedRef.current = false;
    }, 0);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (isOpen) {
      setIsOpen(false);
    } else {
      handleOpen();
    }
  };

  const currentCoords = {
    x: coords.x + dragDelta.x,
    y: coords.y + dragDelta.y,
  };
  const btnWidth = buttonNode?.offsetWidth ?? TRIGGER_SIZE_FALLBACK;
  const defaultTriggerLeft =
    typeof window === 'undefined'
      ? 0
      : window.innerWidth - TRIGGER_EDGE_PADDING - btnWidth;
  const triggerLeft = defaultTriggerLeft + currentCoords.x;
  const triggerRight = triggerLeft + btnWidth;
  const triggerCenterX = triggerLeft + btnWidth / 2;
  const isCardDockedLeft =
    typeof window === 'undefined'
      ? coords.x !== 0
      : triggerCenterX < window.innerWidth / 2;
  const shouldDockCardBesideTrigger =
    typeof window !== 'undefined' && window.innerWidth >= 460 && isOpen;
  const cardSideOffset = (() => {
    if (typeof window === 'undefined') return 24;
    if (!shouldDockCardBesideTrigger) return 24;

    if (isCardDockedLeft) {
      return Math.max(24, triggerRight + 16);
    }

    return Math.max(24, window.innerWidth - triggerLeft + 16);
  })();
  const maxCardHeight =
    typeof window === 'undefined'
      ? CHAT_WIDGET_HEIGHT
      : Math.min(
          CHAT_WIDGET_HEIGHT,
          window.innerHeight - CHAT_WIDGET_BOTTOM - VIEWPORT_PADDING,
        );
  const defaultCardTop =
    typeof window === 'undefined'
      ? 0
      : window.innerHeight - CHAT_WIDGET_BOTTOM - maxCardHeight;
  const minCardY =
    typeof window === 'undefined'
      ? currentCoords.y
      : VIEWPORT_PADDING - defaultCardTop;
  const maxCardY = CHAT_WIDGET_BOTTOM - VIEWPORT_PADDING;
  const cardTranslateY =
    typeof window === 'undefined'
      ? currentCoords.y
      : Math.max(minCardY, Math.min(maxCardY, currentCoords.y));
  const isDraggingTrigger = dragDelta.x !== 0 || dragDelta.y !== 0;

  const cardStyle: React.CSSProperties = {
    height: maxCardHeight,
    transform: `translateY(${cardTranslateY}px)`,
    left: isCardDockedLeft ? `${cardSideOffset}px` : 'auto',
    right: isCardDockedLeft ? 'auto' : `${cardSideOffset}px`,
    transition: isDraggingTrigger
      ? 'none'
      : 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28), left 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28), right 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
  };

  if (profile?.role !== 'parent') return null;

  return (
    <DndContext
      sensors={sensors}
      autoScroll={false}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {isOpen && (
        <Card
          className="fixed bottom-20 z-50 flex w-90 max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden border border-border bg-card shadow-2xl rounded-2xl animate-in slide-in-from-bottom-4 fade-in duration-200"
          style={cardStyle}
        >

          {/* ── HEADER ─────────────────────────────── */}
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Bot className="h-4 w-4 shrink-0 opacity-80" />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight truncate max-w-50">
                  {activeConvId && activeConvTitle ? activeConvTitle : 'Trợ lý AI EduLink'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* History toggle icon */}
              <button
                onClick={() => setShowHistory((v) => !v)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showHistory
                    ? 'bg-white/20 text-primary-foreground'
                    : 'hover:bg-white/10 text-primary-foreground/70 hover:text-primary-foreground'
                }`}
                title="Lịch sử trò chuyện"
              >
                <History className="h-4 w-4" />
              </button>

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── HISTORY PANEL (overlay) ─────────────── */}
          {showHistory && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Quay lại"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <p className="text-xs font-semibold text-foreground">Lịch sử trò chuyện</p>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1.5 rounded-lg px-3"
                  onClick={handleNewChat}
                  disabled={createMutation.isPending}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Mới
                </Button>
              </div>

              <ScrollArea className="flex-1 px-2 py-2">
                {convsLoading ? (
                  <div className="space-y-1.5 p-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                    <History className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">Chưa có cuộc trò chuyện nào.</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {conversations.map((c) => {
                      const isActive = activeConvId === c.conversation_id;
                      return (
                        <button
                          key={c.conversation_id}
                          onClick={() => selectConversation(c.conversation_id)}
                          className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all font-medium ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          {isActive
                            ? <Check className={`h-3.5 w-3.5 shrink-0 opacity-80`} />
                            : <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                          }
                          <span className="truncate">{c.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* ── CHAT AREA ──────────────────────────────── */}
          {!showHistory && (
            <>
              {/* Sub-header: only when a conversation is active */}
              {activeConvId && (
                <div className="flex items-center justify-between border-t border-border px-3 py-1 bg-muted/20 shrink-0">
                  <button
                    onClick={() => {
                      sendMutation.reset();
                      setOptimisticUserMsg(null);
                      setActiveConvId(null);
                    }}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Quay lại"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <Link
                    href={`/parent/chat?conv=${activeConvId}`}
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                    title="Mở rộng trên trang đầy đủ"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                {/* Empty state: no conversation selected yet */}
                {!activeConvId && messages.length === 0 && !activeOptimisticUserMsg && !isSendingActiveConversation && !createMutation.isPending && (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Trợ lý học tập</p>
                    <p className="text-xs text-muted-foreground max-w-55">
                      Chọn gợi ý hoặc nhập câu hỏi của bạn.
                    </p>
                    <div className="mt-1 flex max-w-65 flex-wrap justify-center gap-2">
                      {[
                        {
                          label: 'Điểm số',
                          prompt: 'Con tôi điểm số hiện tại như thế nào?',
                        },
                        {
                          label: 'Chuyên cần',
                          prompt: 'Tình hình chuyên cần của con tôi thế nào?',
                        },
                        {
                          label: 'Thông báo mới',
                          prompt: 'Có thông báo mới nào liên quan đến con tôi không?',
                        },
                        {
                          label: 'Lịch học',
                          prompt: 'Lịch học hiện tại của con tôi như thế nào?',
                        },
                      ].map((suggestion) => (
                        <button
                          key={suggestion.label}
                          onClick={() => handleSuggestionClick(suggestion.prompt)}
                          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* New empty conversation selected */}
                {activeConvId && messages.length === 0 && !activeOptimisticUserMsg && !isSendingActiveConversation && !historyLoading && (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <Sparkles className="h-8 w-8 text-primary/50" />
                    <p className="text-sm font-semibold text-foreground">Phòng chat mới!</p>
                    <p className="text-xs text-muted-foreground max-w-55">
                      Gửi câu hỏi đầu tiên — AI sẽ tự đặt tiêu đề cho cuộc hội thoại.
                    </p>
                  </div>
                )}

                {/* Loading history — only when a conversation is selected */}
                {activeConvId && historyLoading && (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-4">
                  {messages.map((item) => (
                    <ChatMessage key={item.chat_id} item={item} />
                  ))}
                  {activeOptimisticUserMsg && (
                    <ChatMessage
                      item={{
                        chat_id: -1,
                        conversation_id: activeOptimisticUserMsg.conversationId,
                        role: 'USER',
                        content: activeOptimisticUserMsg.content,
                        created_at: activeOptimisticUserMsg.createdAt,
                      }}
                    />
                  )}
                  {(isSendingActiveConversation || createMutation.isPending) && (
                    <ChatMessageSkeleton />
                  )}
                </div>
              </div>



              {/* Error banner — rate limit or other send errors */}
              {isSendErrorForActiveConversation && (
                <div className="mx-3 mb-2 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>
                    {(sendMutation.error as AxiosError<{ message?: string }>)?.response?.status === 429
                      ? 'Mô hình AI đã hết giới hạn sử dụng tạm thời. Vui lòng thử lại sau ít phút.'
                      : ((sendMutation.error as AxiosError<{ message?: string }>)?.response?.data?.message ?? 'Gửi tin nhắn thất bại. Vui lòng thử lại.')}
                  </span>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-border p-3 shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/70"
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 rounded-xl shrink-0"
                    onClick={handleSend}
                    disabled={!message.trim() || sendMutation.isPending || createMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Floating trigger */}
      <ChatWidgetTrigger
        coords={coords}
        isOpen={isOpen}
        onClick={handleClick}
        setButtonNode={setButtonNode}
      >
        {isOpen ? <X className="h-6! w-6!" /> : <MessageCircle className="h-5! w-5!" />}
      </ChatWidgetTrigger>
    </DndContext>
  );
}
