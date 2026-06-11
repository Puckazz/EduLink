'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AxiosError } from 'axios';
import { useAutoResize } from '@/hooks/useAutoResize';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Plus,
  Edit2,
  Check,
  X,
  MessageSquare,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
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
import { ChatMessage, ChatMessageSkeleton } from './ChatMessage';
import { useConversations } from '@/hooks/queries/useConversations';
import { useCreateConversation } from '@/hooks/mutations/useCreateConversation';
import { useUpdateConversation } from '@/hooks/mutations/useUpdateConversation';
import { useDeleteConversation } from '@/hooks/mutations/useDeleteConversation';
import { useSendChatMessage } from '@/hooks/mutations/useSendChatMessage';
import { useChatHistory } from '@/hooks/queries/useChatHistory';
import { useClearChatHistory } from '@/hooks/mutations/useClearChatHistory';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useStudentStore } from '@/stores/useStudentStore';
import type { ChatHistoryItem } from '@/types/ai';
import type { ParentProfile } from '@/types/auth';

function ChatSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pb-12">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="h-[calc(100vh-11rem)] rounded-2xl bg-muted" />
    </div>
  );
}

type OptimisticUserMessage = {
  conversationId: number;
  content: string;
  createdAt: string;
};

export function ChatPage() {
  const [message, setMessage] = useState('');
  const { selectedStudentId } = useStudentStore();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);
  const [optimisticUserMsg, setOptimisticUserMsg] =
    useState<OptimisticUserMessage | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevStudentIdRef = useRef<number | undefined>(undefined);

  const searchParams = useSearchParams();
  const convParam = searchParams.get('conv');

  const { data: profile, isPending: profileLoading } = useCurrentUser();
  const parentProfile = profile as ParentProfile | undefined;
  const students = useMemo(
    () => parentProfile?.students ?? [],
    [parentProfile?.students],
  );

  const activeStudentId = selectedStudentId || students[0]?.student_id;

  const { data: conversations = [], isPending: conversationsLoading } =
    useConversations(activeStudentId);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.conversation_id === activeConvId),
    [conversations, activeConvId],
  );

  const { data: historyData, isPending: historyLoading } =
    useChatHistory(activeConvId ?? undefined);

  const createMutation = useCreateConversation();
  const updateMutation = useUpdateConversation();
  const deleteMutation = useDeleteConversation(activeStudentId);
  const sendMutation = useSendChatMessage();
  const clearMutation = useClearChatHistory();

  const messages: ChatHistoryItem[] = useMemo(
    () => [...(historyData?.data ?? [])].reverse(),
    [historyData],
  );

  const activeOptimisticUserMsg =
    optimisticUserMsg?.conversationId === activeConvId
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

  const activeStudentName = students.find(
    (s) => s.student_id === activeStudentId,
  )?.full_name;

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useAutoResize(inputRef, message, 160);

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

  // Auto-select conversation from URL param ?conv=ID (navigated from widget expand)
  useEffect(() => {
    if (convParam) {
      const id = Number(convParam);
      if (!isNaN(id) && id > 0) {
        setActiveConvId(id);
        setShowSidebarOnMobile(false);
      }
    }
  }, [convParam]);

  useEffect(() => {
    if (prevStudentIdRef.current !== undefined && prevStudentIdRef.current !== activeStudentId) {
      setActiveConvId(null);
      setShowSidebarOnMobile(true);
    }
    prevStudentIdRef.current = activeStudentId;
  }, [activeStudentId]);

  const handleNewChat = () => {
    if (!activeStudentId || createMutation.isPending) return;
    createMutation.mutate(
      { studentId: activeStudentId },
      {
        onSuccess: (newConv) => {
          setActiveConvId(newConv.conversation_id);
          setShowSidebarOnMobile(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        },
      },
    );
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || sendMutation.isPending) return;

    if (!activeConvId) {
      if (!activeStudentId || createMutation.isPending) return;
      const msgToSend = trimmed;
      setMessage('');
      createMutation.mutate(
        { studentId: activeStudentId },
        {
          onSuccess: (newConv) => {
            setActiveConvId(newConv.conversation_id);
            setShowSidebarOnMobile(false);
            sendMutation.mutate(
              { message: msgToSend, conversationId: newConv.conversation_id },
              { onSuccess: () => setTimeout(scrollToBottom, 100) },
            );
          },
        },
      );
      return;
    }

    sendMutation.reset();

    setOptimisticUserMsg({
      conversationId: activeConvId,
      content: trimmed,
      createdAt: new Date().toISOString(),
    });
    setMessage('');
    setTimeout(scrollToBottom, 50);

    sendMutation.mutate(
      { message: trimmed, conversationId: activeConvId },
      {
        onSuccess: () => {
          setOptimisticUserMsg(null);
          setTimeout(scrollToBottom, 100);
        },
        // On error: keep optimistic message visible so user sees what failed
      },
    );
  };

  const handleSuggestionClick = (promptText: string) => {
    if (!activeStudentId || createMutation.isPending) return;
    createMutation.mutate(
      { studentId: activeStudentId },
      {
        onSuccess: (newConv) => {
          setActiveConvId(newConv.conversation_id);
          setShowSidebarOnMobile(false);
          sendMutation.mutate(
            { message: promptText, conversationId: newConv.conversation_id },
            { onSuccess: () => setTimeout(scrollToBottom, 100) },
          );
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startEditing = (id: number, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const cancelEditing = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const saveTitle = (id: number, e: React.SyntheticEvent) => {
    e.stopPropagation();
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    updateMutation.mutate(
      { id, title: trimmed },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const handleDeleteConv = (id: number, e: React.SyntheticEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (activeConvId === id) setActiveConvId(null);
      },
    });
  };

  const handleExitConversation = () => {
    sendMutation.reset();
    setOptimisticUserMsg(null);
    setActiveConvId(null);
  };

  if (profileLoading) return <ChatSkeleton />;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-foreground">
            Trò chuyện AI
          </h1>
          <p className="text-sm text-muted-foreground">
            Hỏi đáp về học tập, điểm số, chuyên cần và thông báo của con bằng AI
          </p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-11rem)] overflow-hidden rounded-2xl border border-border bg-card">
        {/* SIDEBAR: List of conversations */}
        <div
          className={`w-full md:w-[320px] shrink-0 border-r border-border flex flex-col bg-muted/20 transition-all ${
            showSidebarOnMobile ? 'block' : 'hidden md:flex'
          }`}
        >
          <div className="flex h-18 items-center gap-2 border-b border-border p-4">
            <Button
              className="flex-1 rounded-xl font-medium gap-1.5 shadow-sm"
              onClick={handleNewChat}
              disabled={createMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              Cuộc trò chuyện mới
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  title="Xóa toàn bộ lịch sử"
                  disabled={conversations.length === 0 || clearMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa toàn bộ các cuộc trò chuyện?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tất cả các phiên trò chuyện{' '}
                    {activeStudentName && (
                      <>
                        liên quan đến <strong>{activeStudentName}</strong>
                      </>
                    )}{' '}
                    sẽ bị xóa vĩnh viễn. Hành động này không thể khôi phục.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      clearMutation.mutate(activeStudentId, {
                        onSuccess: () => {
                          setActiveConvId(null);
                        },
                      });
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Xóa tất cả
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <ScrollArea className="flex-1 p-2">
            {conversationsLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-2 mt-8">
                <MessageSquare className="h-8 w-8 opacity-40" />
                <p className="text-xs">Chưa có cuộc trò chuyện nào.</p>
                <p className="text-[10px]">Bấm nút bên trên để bắt đầu hỏi AI!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((c) => {
                  const isActive = activeConvId === c.conversation_id;
                  const isEditing = editingId === c.conversation_id;

                  return (
                    <div
                      key={c.conversation_id}
                      onClick={() => {
                        setActiveConvId(c.conversation_id);
                        setShowSidebarOnMobile(false);
                      }}
                      className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-7 text-xs bg-background text-foreground py-1 px-2 rounded-md"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTitle(c.conversation_id, e);
                              if (e.key === 'Escape') cancelEditing(e);
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 shrink-0 text-emerald-500 hover:text-emerald-600 hover:bg-muted/50"
                            onClick={(e) => saveTitle(c.conversation_id, e)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 shrink-0 text-rose-500 hover:text-rose-600 hover:bg-muted/50"
                            onClick={cancelEditing}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5 truncate pr-14">
                            <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'opacity-90' : 'opacity-60'}`} />
                            <span className="truncate">{c.title}</span>
                          </div>

                          {/* Quick action buttons — always reserve space, show on hover */}
                          <div className="absolute right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-7 w-7 rounded-md ${
                                isActive
                                  ? 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                              onClick={(e) => startEditing(c.conversation_id, c.title, e)}
                              title="Đổi tên"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className={`h-7 w-7 rounded-md ${
                                    isActive
                                      ? 'text-primary-foreground/80 hover:text-rose-300 hover:bg-white/10'
                                      : 'text-muted-foreground hover:text-destructive hover:bg-muted'
                                  }`}
                                  onClick={(e) => e.stopPropagation()}
                                  title="Xóa"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa cuộc hội thoại này?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cuộc hội thoại <strong>{c.title}</strong> sẽ bị xóa vĩnh viễn khỏi tài khoản của bạn.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={(e) => handleDeleteConv(c.conversation_id, e)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* CHAT AREA */}
        <div
          className={`flex-1 flex flex-col h-full bg-muted/20 transition-all ${
            showSidebarOnMobile ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Main header when conversation active */}
          {activeConvId ? (
            <div className="flex h-18 items-center border-b border-border px-4">
              <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="md:hidden rounded-lg h-9 w-9 shrink-0"
                    onClick={() => setShowSidebarOnMobile(true)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="min-w-0 space-y-0.5">
                    <h2 className="truncate text-sm font-semibold text-foreground">
                      {activeConversation?.title || 'Cuộc trò chuyện'}
                    </h2>
                    <p className="truncate text-[10px] text-muted-foreground">
                      Theo dõi: <strong>{activeStudentName}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Thoát cuộc trò chuyện"
                    onClick={handleExitConversation}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Header for mobile welcome state to toggle sidebar
            <div className="md:hidden flex items-center border-b border-border px-4 py-3 bg-muted/10">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground"
                onClick={() => setShowSidebarOnMobile(true)}
              >
                <ChevronLeft className="h-4 w-4" />
                Xem lịch sử chat
              </Button>
            </div>
          )}

          <ScrollArea
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-6"
          >
            <div className="mx-auto w-full max-w-4xl">
              {/* WELCOME / EMPTY STATE */}
              {!activeConvId && (
                <div className="flex h-full flex-col items-center justify-center gap-5 py-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 animate-bounce">
                    <Bot className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-foreground">
                      Xin chào phụ huynh! 👋
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Tôi là trợ lý AI học tập của EduLink. Hãy chọn một cuộc trò chuyện ở sidebar hoặc tạo một phiên mới để tìm hiểu về điểm số, chuyên cần và thông báo của{' '}
                      <strong>{activeStudentName}</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mt-6 w-full">
                    {[
                      'Con tôi học kỳ này điểm thế nào?',
                      'Con tôi có nghỉ học nhiều không?',
                      'So sánh kết quả với kỳ trước?',
                      'Có thông báo nào mới nhất không?',
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSuggestionClick(q)}
                        className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-xs font-semibold text-left text-foreground transition-colors hover:border-primary/50 hover:bg-muted/30"
                      >
                        <Sparkles className="h-4 w-4 text-primary shrink-0" />
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeConvId && messages.length === 0 && !activeOptimisticUserMsg && !historyLoading && !isSendingActiveConversation && (
                <div className="flex h-full flex-col items-center justify-center py-20 text-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Phòng chat mới đã sẵn sàng!
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Gửi câu hỏi đầu tiên của bạn dưới đây, tôi sẽ tự động đặt tiêu đề cho cuộc hội thoại này.
                  </p>
                </div>
              )}

              {activeConvId && historyLoading && (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}

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
                {isSendingActiveConversation && <ChatMessageSkeleton />}
              </div>
            </div>
          </ScrollArea>



          {/* Error banner */}
          {isSendErrorForActiveConversation && activeConvId && (
            <div className="px-4 pb-3">
              <div className="mx-auto flex w-full max-w-4xl items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>
                  {(sendMutation.error as AxiosError<{ message?: string }>)?.response?.status === 429
                    ? 'Mô hình AI đã hết giới hạn sử dụng tạm thời. Vui lòng thử lại sau ít phút.'
                    : ((sendMutation.error as AxiosError<{ message?: string }>)?.response?.data?.message ?? 'Gửi tin nhắn thất bại. Vui lòng thử lại.')}
                </span>
              </div>
            </div>
          )}

          {/* Input field */}
          <div className="border-t border-border p-4">
            <div className="flex items-end gap-3 max-w-4xl mx-auto w-full">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi về điểm số, chuyên cần..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/70"
                disabled={sendMutation.isPending || createMutation.isPending}
              />
              <Button
                size="icon"
                className="h-11 w-11 rounded-xl shrink-0"
                onClick={handleSend}
                disabled={!message.trim() || sendMutation.isPending || createMutation.isPending}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
