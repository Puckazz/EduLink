'use client';

import { useQuery } from '@tanstack/react-query';
import { AiService } from '@/services/ai.service';

export function useConversations(studentId?: number) {
  return useQuery({
    queryKey: ['chat-conversations', studentId],
    queryFn: () => AiService.getConversations(studentId),
    enabled: typeof studentId === 'number',
    staleTime: 5 * 1000, // 5 seconds stale time
  });
}
