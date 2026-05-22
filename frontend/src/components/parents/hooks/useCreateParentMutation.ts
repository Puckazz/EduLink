import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ParentService } from '@/services/parent.service';
import type { CreateParentDto } from '@/types/parent';

interface UseCreateParentMutationOptions {
  onSuccess?: () => void;
}

export function useCreateParentMutation(
  options?: UseCreateParentMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateParentDto) => ParentService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['parents'] });
      options?.onSuccess?.();
    },
  });
}
