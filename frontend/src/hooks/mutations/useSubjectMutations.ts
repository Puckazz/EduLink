'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubjectService } from '@/services/subject.service';
import type { CreateSubjectDto, UpdateSubjectDto } from '@/types/subject';

/** [Admin] Tạo môn học mới */
export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSubjectDto) => SubjectService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

/** [Admin] Cập nhật môn học */
export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateSubjectDto }) =>
      SubjectService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

/** [Admin] Xóa môn học */
export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => SubjectService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}
