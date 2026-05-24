'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AiService } from '@/services/ai.service';
import { toast } from 'sonner';

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, title }: { studentId: number; title?: string }) =>
      AiService.createConversation(studentId, title),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['chat-conversations', data.student_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['chat-conversations', undefined],
      });
    },
    onError: () => {
      toast.error('Tạo cuộc hội thoại thất bại. Vui lòng thử lại.');
    },
  });
}
