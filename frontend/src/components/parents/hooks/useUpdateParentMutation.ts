import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ParentService } from '@/services/parent.service';
import type { UpdateParentDto } from '@/types/parent';

interface UseUpdateParentMutationOptions {
  onSuccess?: () => void;
}

interface UpdateParentPayload {
  parentId: number;
  data: UpdateParentDto;
}

export function useUpdateParentMutation(
  options?: UseUpdateParentMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, data }: UpdateParentPayload) =>
      ParentService.update(parentId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['parents'] });
      options?.onSuccess?.();
    },
  });
}
