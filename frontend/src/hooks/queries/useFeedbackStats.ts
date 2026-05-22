'use client';
import { useQuery } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedback.service';

export function useFeedbackStats() {
  return useQuery({
    queryKey: ['feedbacks', 'stats'],
    queryFn: () => FeedbackService.getStats(),
    staleTime: 60_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}
