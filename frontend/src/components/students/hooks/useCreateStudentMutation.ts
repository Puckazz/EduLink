import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentService } from '@/services/student.service';
import type { CreateStudentDto } from '@/types/student';

interface UseCreateStudentMutationOptions {
  onSuccess?: () => void;
}

export function useCreateStudentMutation(
  options?: UseCreateStudentMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStudentDto) => StudentService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      options?.onSuccess?.();
    },
  });
}
