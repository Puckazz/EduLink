'use client';

import { useEffect, useState } from 'react';
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
import type {
  CreateClassSectionDto,
  Subject,
  Teacher,
} from '@/types/attendance';
import { useAcademicTerms } from '@/hooks/queries/useAcademicTerms';

const DAY_OPTIONS = [
  'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật',
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const EMPTY: CreateClassSectionDto = {
  class_code: '',
  teacher_name: '',
  day_of_week: '',
  start_time: '',
  end_time: '',
  room: '',
  term_id: 0,
  subject_id: 0,
};

export function CreateClassSectionDialog({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<CreateClassSectionDto>(EMPTY);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [saving, setSaving] = useState(false);
  const { terms, activeTerm } = useAcademicTerms();

  useEffect(() => {
    if (!open) return;
    setForm({ ...EMPTY, term_id: activeTerm?.term_id ?? 0 });
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
  }, [open, activeTerm]);

  const set = (key: keyof CreateClassSectionDto, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.class_code.trim()) return toast.error('Vui lòng nhập mã lớp.');
    if (!form.teacher_id) return toast.error('Vui lòng chọn giảng viên.');
    if (!form.day_of_week) return toast.error('Vui lòng chọn thứ.');
    if (!form.start_time.trim() || !form.end_time.trim()) return toast.error('Vui lòng nhập giờ học.');
    if (!form.room.trim()) return toast.error('Vui lòng nhập phòng học.');
    if (!form.term_id) return toast.error('Vui lòng chọn học kỳ.');
    if (!form.subject_id) return toast.error('Vui lòng chọn môn học.');

    setSaving(true);
    try {
      await ClassSectionService.create(form);
      toast.success(`Đã tạo lớp "${form.class_code}" thành công.`);
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

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="class_code">Mã lớp <span className="text-red-500">*</span></Label>
            <Input
              id="class_code"
              placeholder="VD: L01"
              value={form.class_code}
              onChange={(e) => set('class_code', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Môn học <span className="text-red-500">*</span></Label>
            <Select
              value={form.subject_id ? String(form.subject_id) : ''}
              onValueChange={(v) => set('subject_id', Number(v))}
              disabled={loadingSubjects}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingSubjects ? 'Đang tải...' : 'Chọn môn học'} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.subject_id} value={String(s.subject_id)}>
                    {s.subject_code} — {s.subject_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label>Giảng viên <span className="text-red-500">*</span></Label>
            <Select
              value={form.teacher_id ? String(form.teacher_id) : ''}
              onValueChange={(v) => {
                const tId = Number(v);
                const teacher = teachers.find((t) => t.teacher_id === tId);
                setForm((prev) => ({
                  ...prev,
                  teacher_id: tId,
                  teacher_name: teacher?.full_name ?? '',
                }));
              }}
              disabled={loadingTeachers}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingTeachers ? 'Đang tải...' : 'Chọn giảng viên'} />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.teacher_id} value={String(t.teacher_id)}>
                    {t.full_name} (Mã: {t.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Thứ <span className="text-red-500">*</span></Label>
            <Select value={form.day_of_week} onValueChange={(v) => set('day_of_week', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn thứ" />
              </SelectTrigger>
              <SelectContent>
                {DAY_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="room">Phòng học <span className="text-red-500">*</span></Label>
            <Input
              id="room"
              placeholder="VD: A1.202"
              value={form.room}
              onChange={(e) => set('room', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="start_time">Giờ bắt đầu <span className="text-red-500">*</span></Label>
            <Input
              id="start_time"
              placeholder="VD: 7:30"
              value={form.start_time}
              onChange={(e) => set('start_time', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="end_time">Giờ kết thúc <span className="text-red-500">*</span></Label>
            <Input
              id="end_time"
              placeholder="VD: 9:30"
              value={form.end_time}
              onChange={(e) => set('end_time', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Học kỳ <span className="text-red-500">*</span></Label>
            <Select
              value={form.term_id ? String(form.term_id) : ''}
              onValueChange={(v) => set('term_id', Number(v))}
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
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Đang tạo...' : 'Tạo lớp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
