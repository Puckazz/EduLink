'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentService } from '@/services/student.service';
import { toast } from 'sonner';

interface UseAssignParentMutationOptions {
  onSuccess?: () => void;
}

function getApiErrorMessage(
  error: unknown,
  fallback: string = 'Đã xảy ra lỗi',
): string {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return fallback;
  }

  const response = (error as { response?: { data?: { message?: unknown } } })
    .response;
  const responseMessage = response?.data?.message;

  if (Array.isArray(responseMessage) && responseMessage.length > 0) {
    return String(responseMessage[0]);
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  return fallback;
}

export function useAssignParentMutation(
  options?: UseAssignParentMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      parentId,
    }: {
      studentId: number;
      parentId: number;
    }) => StudentService.assignParent(studentId, { parent_id: parentId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Liên kết phụ huynh thành công');
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error);
      toast.error(message || 'Lỗi khi liên kết phụ huynh');
    },
  });
}
