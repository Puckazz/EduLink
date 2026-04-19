import { z } from 'zod';

export const parentAssignSchema = z.object({
  studentId: z.number({ message: 'Vui lòng chọn sinh viên' }),
  parentId: z.number({ message: 'Vui lòng chọn phụ huynh' }),
});

export type ParentAssignFormValues = z.infer<typeof parentAssignSchema>;

export const defaultParentAssignValues: ParentAssignFormValues = {
  studentId: 0,
  parentId: 0,
};
