'use client';
import { useQuery } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedback.service';

export function useFeedbackAnalytics() {
  return useQuery({
    queryKey: ['feedbacks', 'analytics'],
    queryFn: () => FeedbackService.getAnalytics(),
    staleTime: 5 * 60_000, // 5 phút
  });
}
