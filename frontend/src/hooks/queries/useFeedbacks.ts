'use client';
import { useQuery } from '@tanstack/react-query';
import { FeedbackService } from '@/services/feedback.service';

export interface FeedbackQueryParams {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'updated_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export function useFeedbacks(params?: FeedbackQueryParams) {
  return useQuery({
    queryKey: ['feedbacks', params],
    queryFn: () => FeedbackService.getAll(params),
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    placeholderData: (prev) => prev,
  });
}
