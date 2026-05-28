import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TeacherService } from '@/services/teacher.service';
import type { CreateTeacherDto } from '@/types/teacher';

interface UseCreateTeacherMutationOptions {
  onSuccess?: () => void;
}

export function useCreateTeacherMutation(
  options?: UseCreateTeacherMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeacherDto) => TeacherService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teachers'] });
      options?.onSuccess?.();
    },
  });
}
