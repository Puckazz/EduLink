'use client';
import { useQuery } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedback.service';

export function useFeedbackMessages(feedbackId: number | null) {
  return useQuery({
    queryKey: ['feedback', feedbackId, 'messages'],
    queryFn: () => FeedbackService.getMessages(feedbackId!),
    enabled: feedbackId !== null,
    staleTime: 15_000,
  });
}
