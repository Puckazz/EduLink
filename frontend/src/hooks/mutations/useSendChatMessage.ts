'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AiService } from '@/services/ai.service';
import { toast } from 'sonner';
import type { ChatConversation, ChatRequest } from '@/types/ai';
import type { AxiosError } from 'axios';

const buildOptimisticConversationTitle = (message: string) => {
  const normalized = message.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 42) return normalized;
  return `${normalized.slice(0, 39).trim()}...`;
};

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  const refreshConversations = () => {
    void queryClient.invalidateQueries({
      queryKey: ['chat-conversations'],
    });
  };

  return useMutation({
    mutationFn: (data: ChatRequest) => AiService.sendChatMessage(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat-history', variables.conversationId],
      });
      queryClient.setQueriesData<ChatConversation[]>(
        { queryKey: ['chat-conversations'] },
        (current) => {
          if (!current) return current;

          const nextTitle = buildOptimisticConversationTitle(variables.message);
          return current.map((conversation) =>
            conversation.conversation_id === variables.conversationId &&
            conversation.title === 'Trò chuyện mới'
              ? { ...conversation, title: nextTitle }
              : conversation,
          );
        },
      );
      refreshConversations();
      window.setTimeout(refreshConversations, 1_500);
      window.setTimeout(refreshConversations, 6_500);
      window.setTimeout(refreshConversations, 14_000);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message;

      if (status === 429) {
        // Rate limit — show inline, no toast spam
        return;
      }

      const msg =
        typeof serverMsg === 'string' && serverMsg
          ? serverMsg
          : 'Gửi tin nhắn thất bại. Vui lòng thử lại.';

      toast.error(msg);
    },
  });
}
