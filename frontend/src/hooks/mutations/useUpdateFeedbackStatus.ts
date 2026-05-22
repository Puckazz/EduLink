'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedback.service';
import type { FeedbackStatus } from '@/types/feedback';
import { toast } from 'sonner';

export function useUpdateFeedbackStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: FeedbackStatus }) =>
      FeedbackService.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Đã cập nhật trạng thái phản hồi.');
    },
    onError: () => {
      toast.error('Cập nhật trạng thái thất bại.');
    },
  });
}
