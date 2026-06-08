'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import type { Subject, Teacher } from '@/types/attendance';
import { useAcademicTerms } from '@/hooks/queries/useAcademicTerms';
import {
  classSectionFormSchema,
  defaultClassSectionFormValues,
  mapClassSectionFormToCreateDto,
  type ClassSectionFormValues,
} from '@/components/attendance/utils/class-section-form.schema';

const DAY_OPTIONS = [
  'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật',
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function CreateClassSectionDialog({ open, onClose, onCreated }: Props) {
  const form = useForm<ClassSectionFormValues>({
    resolver: zodResolver(classSectionFormSchema),
    defaultValues: defaultClassSectionFormValues,
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [saving, setSaving] = useState(false);
  const { terms, activeTerm } = useAcademicTerms();

  useEffect(() => {
    if (!open) return;

    form.reset({
      ...defaultClassSectionFormValues,
      term_id: activeTerm?.term_id ? String(activeTerm.term_id) : '',
    });

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
  }, [open, activeTerm, form]);

  const handleSubmit = async (values: ClassSectionFormValues) => {
    const dto = mapClassSectionFormToCreateDto(values);

    setSaving(true);
    try {
      await ClassSectionService.create(dto);
      toast.success(`Đã tạo lớp "${dto.class_code}" thành công.`);
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Tạo lớp thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">
            Tạo lớp học phần mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="class_code">Mã lớp <span className="text-red-500">*</span></Label>
              <Input
                id="class_code"
                placeholder="VD: L01"
                {...form.register('class_code')}
              />
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
              <Label>Thứ <span className="text-red-500">*</span></Label>
              <Select
                value={form.watch('day_of_week')}
                onValueChange={(value) => {
                  form.setValue('day_of_week', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger>
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
              <Label htmlFor="room">Phòng học <span className="text-red-500">*</span></Label>
              <Input
                id="room"
                placeholder="VD: A1.202"
                {...form.register('room')}
              />
              <FieldError message={form.formState.errors.room?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="start_time">Giờ bắt đầu <span className="text-red-500">*</span></Label>
              <Input
                id="start_time"
                placeholder="VD: 7:30"
                {...form.register('start_time')}
              />
              <FieldError message={form.formState.errors.start_time?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end_time">Giờ kết thúc <span className="text-red-500">*</span></Label>
              <Input
                id="end_time"
                placeholder="VD: 9:30"
                {...form.register('end_time')}
              />
              <FieldError message={form.formState.errors.end_time?.message} />
            </div>

            <div className="space-y-1.5">
              <Label>Học kỳ <span className="text-red-500">*</span></Label>
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Đang tạo...' : 'Tạo lớp'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
