import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ParentService } from '@/services/parent.service';

interface SetParentLockPayload {
  parentId: number;
  isLocked: boolean;
}

export function useSetParentLockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, isLocked }: SetParentLockPayload) =>
      ParentService.setLockStatus(parentId, { is_locked: isLocked }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['parents'] }),
        queryClient.invalidateQueries({
          queryKey: ['parent-detail', variables.parentId],
        }),
      ]);
    },
  });
}
