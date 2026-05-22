'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedback.service';
import { toast } from 'sonner';

interface SendMessageArgs {
  feedbackId: number;
  content: string;
  role: 'parent' | 'admin';
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, content, role }: SendMessageArgs) => {
      const dto = { content };
      if (role === 'admin') {
        return FeedbackService.adminReply(feedbackId, dto);
      }
      return FeedbackService.sendMessage(feedbackId, dto);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', variables.feedbackId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
    },
    onError: () => {
      toast.error('Gửi tin nhắn thất bại. Vui lòng thử lại.');
    },
  });
}
