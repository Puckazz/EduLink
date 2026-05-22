import { z } from 'zod';
import { createStudentFormSchema } from './create-student-form.schema';

export const updateStudentFormSchema = createStudentFormSchema;

export type UpdateStudentFormValues = z.infer<typeof updateStudentFormSchema>;
