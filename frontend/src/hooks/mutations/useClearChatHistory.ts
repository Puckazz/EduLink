'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AiService } from '@/services/ai.service';
import { toast } from 'sonner';

export function useClearChatHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId?: number) =>
      studentId
        ? AiService.clearChatHistoryByStudent(studentId)
        : AiService.clearChatHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      toast.success('Đã xóa lịch sử trò chuyện');
    },
    onError: () => {
      toast.error('Xóa lịch sử thất bại. Vui lòng thử lại.');
    },
  });
}

