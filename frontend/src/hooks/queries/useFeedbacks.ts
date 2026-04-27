'use client';
import { useQuery } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedback.service';

export interface FeedbackQueryParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useFeedbacks(params?: FeedbackQueryParams) {
  return useQuery({
    queryKey: ['feedbacks', params],
    queryFn: () => FeedbackService.getAll(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev, // keep previous data during page transitions
  });
}
