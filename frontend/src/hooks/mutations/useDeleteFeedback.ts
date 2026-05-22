'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedback.service';
import { toast } from 'sonner';

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => FeedbackService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Đã xóa phản hồi thành công.');
    },
    onError: () => {
      toast.error('Xóa phản hồi thất bại. Vui lòng thử lại.');
    },
  });
}
