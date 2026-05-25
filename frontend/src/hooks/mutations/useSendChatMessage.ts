'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AiService } from '@/services/ai.service';
import { toast } from 'sonner';
import type { ChatRequest } from '@/types/ai';
import type { AxiosError } from 'axios';

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChatRequest) => AiService.sendChatMessage(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat-history', variables.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['chat-conversations'],
      });
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
