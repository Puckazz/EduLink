'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MajorService } from '@/services/major.service';
import type { CreateMajorDto, UpdateMajorDto } from '@/types/major';

/** [Admin] Tạo ngành học mới */
export function useCreateMajor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMajorDto) => MajorService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['majors'] });
    },
  });
}

/** [Admin] Cập nhật ngành học */
export function useUpdateMajor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateMajorDto }) =>
      MajorService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['majors'] });
    },
  });
}

/** [Admin] Xóa ngành học */
export function useDeleteMajor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => MajorService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['majors'] });
    },
  });
}
