'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [optimisticUserMsg, setOptimisticUserMsg] = useState<string | null>(null);

  // Drag-and-drop & snapping states
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartCoords = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
  }, [messages.length, scrollToBottom]);

  // Reset stale send data when switching conversations
  useEffect(() => {
    sendMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvId]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowHistory(false);
    // Do NOT auto-select a conversation — start fresh
  };

  const selectConversation = (id: number) => {
    setActiveConvId(id);
    setShowHistory(false);
    setTimeout(scrollToBottom, 200);
  };

  const handleNewChat = () => {
    if (!activeStudentId || createMutation.isPending) return;
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
    if (!trimmed || sendMutation.isPending || createMutation.isPending) return;

    // Clear any previous error so banner disappears on retry
    sendMutation.reset();

    setOptimisticUserMsg(trimmed);
    setMessage('');
    setTimeout(scrollToBottom, 50);

    if (activeConvId) {
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
      createMutation.mutate(
        { studentId: activeStudentId },
        {
          onSuccess: (newConv) => {
            setActiveConvId(newConv.conversation_id);
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
    setMessage(q);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartCoords.current = { x: e.clientX, y: e.clientY };
    dragStartPos.current = { x: coords.x, y: coords.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartCoords.current.x;
    const dy = e.clientY - dragStartCoords.current.y;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMovedRef.current = true;
    }
    
    setCoords({
      x: dragStartPos.current.x + dx,
      y: dragStartPos.current.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const btnWidth = rect.width;
    const btnHeight = rect.height;
    const padding = 24;

    const defaultLeft = screenWidth - padding - btnWidth;
    const leftDist = rect.left + btnWidth / 2;
    const rightDist = screenWidth - (rect.left + btnWidth / 2);

    let targetX = 0;
    if (leftDist < rightDist) {
      targetX = padding - defaultLeft;
    } else {
      targetX = 0;
    }

    const defaultTop = screenHeight - padding - btnHeight;
    const currentY = coords.y;
    const minY = padding - defaultTop;
    const maxY = 0;
    const targetY = Math.max(minY, Math.min(maxY, currentY));

    setCoords({ x: targetX, y: targetY });
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

  const isSnappedLeft = coords.x !== 0;

  const bubbleStyle: React.CSSProperties = {
    transform: `translate(${coords.x}px, ${coords.y}px)`,
    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
    touchAction: 'none',
  };

  const cardStyle: React.CSSProperties = {
    height: 500,
    transform: `translateY(${coords.y}px)`,
    left: isSnappedLeft ? '24px' : 'auto',
    right: isSnappedLeft ? 'auto' : '24px',
    transition: 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28), left 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28), right 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
  };

  if (profile?.role !== 'parent') return null;

  return (
    <>
      {isOpen && (
        <Card
          className="fixed bottom-20 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden border border-border bg-card shadow-2xl rounded-2xl animate-in slide-in-from-bottom-4 fade-in duration-200"
          style={cardStyle}
        >

          {/* ── HEADER ─────────────────────────────── */}
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Bot className="h-4 w-4 shrink-0 opacity-80" />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight truncate max-w-[200px]">
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
                    onClick={() => setActiveConvId(null)}
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
                {!activeConvId && messages.length === 0 && !sendMutation.isPending && !createMutation.isPending && (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Sẵn sàng trợ lý!</p>
                    <p className="text-xs text-muted-foreground max-w-[220px]">
                      Nhập câu hỏi hoặc chọn gợi ý bên dưới.
                    </p>
                    <div className="flex flex-col gap-1.5 mt-1 w-full px-2">
                      {[
                        'Con tôi điểm thế nào?',
                        'Tình hình chuyên cần?',
                        'Có thông báo mới không?',
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSuggestionClick(q)}
                          className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground text-left hover:bg-muted hover:text-foreground transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* New empty conversation selected */}
                {activeConvId && messages.length === 0 && !optimisticUserMsg && !sendMutation.isPending && !historyLoading && (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <Sparkles className="h-8 w-8 text-primary/50" />
                    <p className="text-sm font-semibold text-foreground">Phòng chat mới!</p>
                    <p className="text-xs text-muted-foreground max-w-[220px]">
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
                  {optimisticUserMsg && (
                    <ChatMessage
                      item={{
                        chat_id: -1,
                        conversation_id: -1,
                        role: 'USER',
                        content: optimisticUserMsg,
                        created_at: new Date().toISOString(),
                      }}
                    />
                  )}
                  {(sendMutation.isPending || createMutation.isPending) && (
                    <ChatMessageSkeleton />
                  )}
                </div>
              </div>



              {/* Error banner — rate limit or other send errors */}
              {sendMutation.isError && (
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
      <Button
        ref={buttonRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        style={bubbleStyle}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg select-none cursor-grab active:cursor-grabbing"
        id="chat-widget-trigger"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </>
  );
}
