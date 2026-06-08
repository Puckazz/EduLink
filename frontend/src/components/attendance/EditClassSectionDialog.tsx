'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ClassSectionService,
  SubjectService,
} from '@/services/attendance.service';
import type {
  ClassSection,
  Subject,
  Teacher,
} from '@/types/attendance';
import { useAcademicTerms } from '@/hooks/queries/useAcademicTerms';
import {
  classSectionFormSchema,
  defaultClassSectionFormValues,
  mapClassSectionFormToUpdateDto,
  type ClassSectionFormValues,
} from '@/components/attendance/utils/class-section-form.schema';

const DAY_OPTIONS = [
  'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật',
];

interface Props {
  section: ClassSection;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: ClassSection) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function getFormFromSection(section: ClassSection): ClassSectionFormValues {
  return {
    class_code: section.class_code,
    teacher_name: section.teacher_name,
    teacher_id: section.teacher_id ? String(section.teacher_id) : '',
    day_of_week: section.day_of_week,
    start_time: section.start_time,
    end_time: section.end_time,
    room: section.room,
    term_id: String(section.term_id),
    subject_id: String(section.subject.subject_id),
  };
}

export function EditClassSectionDialog({ section, open, onClose, onUpdated }: Props) {
  const form = useForm<ClassSectionFormValues>({
    resolver: zodResolver(classSectionFormSchema),
    defaultValues: defaultClassSectionFormValues,
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [saving, setSaving] = useState(false);
  const { terms } = useAcademicTerms();
  const [originalDayOfWeek, setOriginalDayOfWeek] = useState('');

  const selectedDayOfWeek = form.watch('day_of_week');
  const dayChanged = selectedDayOfWeek !== originalDayOfWeek && selectedDayOfWeek !== '';
  const hasSessions = (section._count?.sessions ?? 0) > 0;
  const showDayWarning = dayChanged && hasSessions;

  useEffect(() => {
    if (!open) return;

    form.reset(getFormFromSection(section));
    setOriginalDayOfWeek(section.day_of_week);

    setLoadingSubjects(true);
    SubjectService.getAll()
      .then(setSubjects)
      .catch(() => toast.error('Không thể tải danh sách môn học.'))
      .finally(() => setLoadingSubjects(false));

    setLoadingTeachers(true);
    ClassSectionService.getTeachers()
      .then(setTeachers)
      .catch(() => toast.error('Không thể tải danh sách giảng viên.'))
      .finally(() => setLoadingTeachers(false));
  }, [open, section, form]);

  const handleSubmit = async (values: ClassSectionFormValues) => {
    const dto = mapClassSectionFormToUpdateDto(values);

    setSaving(true);
    try {
      const updated = await ClassSectionService.update(section.section_id, dto);
      toast.success(`Đã cập nhật lớp "${dto.class_code}" thành công.`);
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">
            Chỉnh sửa lớp học phần
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit_class_code">Mã lớp <span className="text-red-500">*</span></Label>
              <Input id="edit_class_code" {...form.register('class_code')} />
              <FieldError message={form.formState.errors.class_code?.message} />
            </div>

            <div className="space-y-1.5">
              <Label>Môn học <span className="text-red-500">*</span></Label>
              <Select
                value={form.watch('subject_id')}
                onValueChange={(value) => {
                  form.setValue('subject_id', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                disabled={loadingSubjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingSubjects ? 'Đang tải...' : 'Chọn môn học'} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.subject_id} value={String(subject.subject_id)}>
                      {subject.subject_code} — {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={form.formState.errors.subject_id?.message} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Giảng viên <span className="text-red-500">*</span></Label>
              <Select
                value={form.watch('teacher_id')}
                onValueChange={(value) => {
                  const teacher = teachers.find(
                    (item) => String(item.teacher_id) === value,
                  );
                  form.setValue('teacher_id', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  form.setValue('teacher_name', teacher?.full_name ?? '', {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                disabled={loadingTeachers}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingTeachers ? 'Đang tải...' : 'Chọn giảng viên'} />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.teacher_id} value={String(teacher.teacher_id)}>
                      {teacher.full_name} (Mã: {teacher.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={form.formState.errors.teacher_id?.message} />
            </div>

            <div className="space-y-1.5">
              <Label>
                Thứ
                {dayChanged && (
                  <span className="ml-1.5 text-[10px] font-semibold text-amber-600 bg-amber-100 rounded px-1 py-0.5">
                    Đã thay đổi
                  </span>
                )}
              </Label>
              <Select
                value={form.watch('day_of_week')}
                onValueChange={(value) => {
                  form.setValue('day_of_week', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger className={dayChanged ? 'border-amber-400 ring-1 ring-amber-300' : ''}>
                  <SelectValue placeholder="Chọn thứ" />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OPTIONS.map((day) => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={form.formState.errors.day_of_week?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_room">Phòng học <span className="text-red-500">*</span></Label>
              <Input id="edit_room" {...form.register('room')} />
              <FieldError message={form.formState.errors.room?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_start">Giờ bắt đầu</Label>
              <Input
                id="edit_start"
                placeholder="VD: 7:30"
                {...form.register('start_time')}
              />
              <FieldError message={form.formState.errors.start_time?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_end">Giờ kết thúc</Label>
              <Input
                id="edit_end"
                placeholder="VD: 9:30"
                {...form.register('end_time')}
              />
              <FieldError message={form.formState.errors.end_time?.message} />
            </div>

            <div className="space-y-1.5">
              <Label>Học kỳ</Label>
              <Select
                value={form.watch('term_id')}
                onValueChange={(value) => {
                  form.setValue('term_id', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn học kỳ" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.term_id} value={String(term.term_id)}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={form.formState.errors.term_id?.message} />
            </div>

            {showDayWarning && (
              <div className="col-span-2 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 leading-relaxed">
                  <p className="font-semibold mb-0.5">Lưu ý về ngày buổi học</p>
                  <p>
                    Lớp này đã có{' '}
                    <strong>{section._count.sessions} buổi học</strong> được tạo.
                    Thay đổi thứ từ{' '}
                    <strong className="text-amber-700">{originalDayOfWeek}</strong> sang{' '}
                    <strong className="text-amber-700">{selectedDayOfWeek}</strong>{' '}
                    sẽ{' '}
                    <strong>không tự động cập nhật</strong> ngày (<em>session_date</em>) của
                    các buổi học đã tạo. Bạn cần vào từng buổi học để điều chỉnh lại ngày
                    cho phù hợp.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className={showDayWarning ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              {saving ? 'Đang lưu...' : showDayWarning ? 'Lưu (đã đọc cảnh báo)' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
