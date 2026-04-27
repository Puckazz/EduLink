'use client';
import { useQuery } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedback.service';

export function useMyFeedbacks() {
  return useQuery({
    queryKey: ['feedbacks', 'mine'],
    queryFn: () => FeedbackService.getMyFeedbacks(),
    staleTime: 30_000,
  });
}
