'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaqService } from '@/services/faq.service';
import type { CreateFaqDto, UpdateFaqDto } from '@/types/faq';

/** [Admin] Tạo FAQ mới */
export function useCreateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFaqDto) => FaqService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}

/** [Admin] Cập nhật FAQ */
export function useUpdateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateFaqDto }) =>
      FaqService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}

/** [Admin] Xóa FAQ */
export function useDeleteFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => FaqService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}
