'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AiService } from '@/services/ai.service';
import { toast } from 'sonner';

export function useDeleteConversation(studentId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AiService.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chat-conversations', studentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['chat-conversations', undefined],
      });
      toast.success('Đã xóa cuộc hội thoại');
    },
    onError: () => {
      toast.error('Xóa cuộc hội thoại thất bại. Vui lòng thử lại.');
    },
  });
}
