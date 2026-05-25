'use client';

import { useQuery } from '@tanstack/react-query';
import { AiService } from '@/services/ai.service';

export function useChatHistory(conversationId?: number) {
  return useQuery({
    queryKey: ['chat-history', conversationId],
    queryFn: () => {
      if (!conversationId) return { data: [], total: 0, page: 1, limit: 50 };
      return AiService.getChatHistory(conversationId, { limit: 50 });
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });
}
