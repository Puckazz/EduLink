import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentService } from '@/services/student.service';
import type { UpdateStudentDto } from '@/types/student';

interface UseUpdateStudentMutationOptions {
  onSuccess?: () => void;
}

export function useUpdateStudentMutation(
  id: number,
  options?: UseUpdateStudentMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStudentDto) => StudentService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      await queryClient.invalidateQueries({ queryKey: ['student-detail', id] });
      options?.onSuccess?.();
    },
  });
}
