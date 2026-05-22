'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedback.service';
import type { CreateFeedbackDto } from '@/types/feedback';
import { toast } from 'sonner';

export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateFeedbackDto) => FeedbackService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', 'mine'] });
      toast.success('Phản hồi đã được gửi thành công!');
    },
    onError: () => {
      toast.error('Gửi phản hồi thất bại. Vui lòng thử lại.');
    },
  });
}
