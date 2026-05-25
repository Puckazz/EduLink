'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AiService } from '@/services/ai.service';
import { toast } from 'sonner';

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      AiService.updateConversation(id, title),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['chat-conversations', data.student_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['chat-conversations', undefined],
      });
      toast.success('Đã đổi tên cuộc trò chuyện');
    },
    onError: () => {
      toast.error('Đổi tên cuộc trò chuyện thất bại. Vui lòng thử lại.');
    },
  });
}
