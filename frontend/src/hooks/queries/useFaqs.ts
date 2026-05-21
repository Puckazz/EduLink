'use client';
import { useQuery } from '@tanstack/react-query';
import { FaqService } from '@/services/faq.service';

/** [Parent/Teacher] Hook lấy danh sách FAQ đang active, group theo category */
export function useFaqs() {
  return useQuery({
    queryKey: ['faqs', 'public'],
    queryFn: () => FaqService.getPublic(),
    staleTime: 5 * 60_000, // FAQ ít thay đổi, cache 5 phút
  });
}

/** [Admin] Hook lấy tất cả FAQ kể cả inactive */
export function useAdminFaqs() {
  return useQuery({
    queryKey: ['faqs', 'admin'],
    queryFn: () => FaqService.getAll(),
    staleTime: 30_000,
  });
}
