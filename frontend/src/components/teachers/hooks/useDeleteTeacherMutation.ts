import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TeacherService } from '@/services/teacher.service';

interface UseDeleteTeacherMutationOptions {
  onSuccess?: () => void;
}

export function useDeleteTeacherMutation(
  options?: UseDeleteTeacherMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teacherId: number) => TeacherService.delete(teacherId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teachers'] });
      options?.onSuccess?.();
    },
  });
}
