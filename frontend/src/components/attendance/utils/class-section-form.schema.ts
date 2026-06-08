import { z } from 'zod';
import type {
  CreateClassSectionDto,
  UpdateClassSectionDto,
} from '@/types/attendance';

const timePattern = /^([01]?\d|2[0-3]):[0-5]\d$/;

export const classSectionFormSchema = z.object({
  class_code: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã lớp.')
    .max(50, 'Mã lớp tối đa 50 ký tự.'),
  teacher_id: z.string().trim().min(1, 'Vui lòng chọn giảng viên.'),
  teacher_name: z.string().trim().min(1, 'Vui lòng chọn giảng viên.'),
  day_of_week: z.string().trim().min(1, 'Vui lòng chọn thứ.'),
  start_time: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập giờ bắt đầu.')
    .regex(timePattern, 'Giờ bắt đầu phải có dạng HH:mm.'),
  end_time: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập giờ kết thúc.')
    .regex(timePattern, 'Giờ kết thúc phải có dạng HH:mm.'),
  room: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập phòng học.')
    .max(50, 'Phòng học tối đa 50 ký tự.'),
  term_id: z.string().trim().min(1, 'Vui lòng chọn học kỳ.'),
  subject_id: z.string().trim().min(1, 'Vui lòng chọn môn học.'),
});

export type ClassSectionFormValues = z.infer<typeof classSectionFormSchema>;

export const defaultClassSectionFormValues: ClassSectionFormValues = {
  class_code: '',
  teacher_id: '',
  teacher_name: '',
  day_of_week: '',
  start_time: '',
  end_time: '',
  room: '',
  term_id: '',
  subject_id: '',
};

export function mapClassSectionFormToCreateDto(
  values: ClassSectionFormValues,
): CreateClassSectionDto {
  return {
    class_code: values.class_code,
    teacher_id: Number(values.teacher_id),
    teacher_name: values.teacher_name,
    day_of_week: values.day_of_week,
    start_time: values.start_time,
    end_time: values.end_time,
    room: values.room,
    term_id: Number(values.term_id),
    subject_id: Number(values.subject_id),
  };
}

export function mapClassSectionFormToUpdateDto(
  values: ClassSectionFormValues,
): UpdateClassSectionDto {
  return mapClassSectionFormToCreateDto(values);
}
