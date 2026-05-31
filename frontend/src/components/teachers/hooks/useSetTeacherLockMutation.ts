import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TeacherService } from '@/services/teacher.service';

interface SetTeacherLockPayload {
  teacherId: number;
  isLocked: boolean;
}

export function useSetTeacherLockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, isLocked }: SetTeacherLockPayload) =>
      TeacherService.setLockStatus(teacherId, { is_locked: isLocked }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
}
