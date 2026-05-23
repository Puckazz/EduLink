'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedback.service';
import { toast } from 'sonner';
import type { PreUploadedAttachment } from '@/types/feedback';

interface SendMessageArgs {
  feedbackId: number;
  content: string;
  role: 'parent' | 'admin';
  attachments?: PreUploadedAttachment[];
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, content, role, attachments }: SendMessageArgs) => {
      const dto = { content, attachments };
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
