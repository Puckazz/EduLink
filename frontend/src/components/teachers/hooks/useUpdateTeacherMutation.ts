import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TeacherService } from '@/services/teacher.service';
import type { UpdateTeacherDto } from '@/types/teacher';

interface UseUpdateTeacherMutationOptions {
  onSuccess?: () => void;
}

interface UpdateTeacherPayload {
  teacherId: number;
  data: UpdateTeacherDto;
}

export function useUpdateTeacherMutation(
  options?: UseUpdateTeacherMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, data }: UpdateTeacherPayload) =>
      TeacherService.update(teacherId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teachers'] });
      options?.onSuccess?.();
    },
  });
}
