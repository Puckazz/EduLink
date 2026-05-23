'use client';

import { useEffect, useState } from 'react';
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
  type Subject,
  type ClassSection,
  type UpdateClassSectionDto,
  type ClassStatus,
} from '@/services/attendance.service';
import { useAcademicTerms } from '@/hooks/queries/useAcademicTerms';

const DAY_OPTIONS = [
  'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật',
];

const STATUS_OPTIONS: { value: ClassStatus; label: string }[] = [
  { value: 'UPCOMING', label: 'Sắp diễn ra' },
  { value: 'ONGOING', label: 'Đang diễn ra' },
  { value: 'FINISHED', label: 'Đã kết thúc' },
];

interface Props {
  section: ClassSection;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: ClassSection) => void;
}

export function EditClassSectionDialog({ section, open, onClose, onUpdated }: Props) {
  const [form, setForm] = useState<UpdateClassSectionDto>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving, setSaving] = useState(false);
  const { terms } = useAcademicTerms();

  const [originalDayOfWeek, setOriginalDayOfWeek] = useState('');

  useEffect(() => {
    if (!open) return;
    const initial: UpdateClassSectionDto = {
      class_code: section.class_code,
      teacher_name: section.teacher_name,
      day_of_week: section.day_of_week,
      start_time: section.start_time,
      end_time: section.end_time,
      room: section.room,
      term_id: section.term_id,
      status: section.status,
      subject_id: section.subject.subject_id,
    };
    setForm(initial);
    setOriginalDayOfWeek(section.day_of_week);
    setLoadingSubjects(true);
    SubjectService.getAll()
      .then(setSubjects)
      .catch(() => toast.error('Không thể tải danh sách môn học.'))
      .finally(() => setLoadingSubjects(false));
  }, [open, section]);

  const set = (key: keyof UpdateClassSectionDto, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const dayChanged = form.day_of_week !== originalDayOfWeek && form.day_of_week !== '';
  const hasSessions = (section._count?.sessions ?? 0) > 0;
  const showDayWarning = dayChanged && hasSessions;

  const handleSubmit = async () => {
    if (!form.class_code?.trim()) return toast.error('Vui lòng nhập mã lớp.');
    if (!form.teacher_name?.trim()) return toast.error('Vui lòng nhập tên giảng viên.');
    if (!form.room?.trim()) return toast.error('Vui lòng nhập phòng học.');

    setSaving(true);
    try {
      const updated = await ClassSectionService.update(section.section_id, form);
      toast.success(`Đã cập nhật lớp "${form.class_code}" thành công.`);
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

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit_class_code">Mã lớp <span className="text-red-500">*</span></Label>
            <Input
              id="edit_class_code"
              value={form.class_code ?? ''}
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
            <Label htmlFor="edit_teacher">Tên giảng viên <span className="text-red-500">*</span></Label>
            <Input
              id="edit_teacher"
              value={form.teacher_name ?? ''}
              onChange={(e) => set('teacher_name', e.target.value)}
            />
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
              value={form.day_of_week ?? ''}
              onValueChange={(v) => set('day_of_week', v)}
            >
              <SelectTrigger className={dayChanged ? 'border-amber-400 ring-1 ring-amber-300' : ''}>
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
            <Label htmlFor="edit_room">Phòng học <span className="text-red-500">*</span></Label>
            <Input
              id="edit_room"
              value={form.room ?? ''}
              onChange={(e) => set('room', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_start">Giờ bắt đầu</Label>
            <Input
              id="edit_start"
              placeholder="VD: 7:30"
              value={form.start_time ?? ''}
              onChange={(e) => set('start_time', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_end">Giờ kết thúc</Label>
            <Input
              id="edit_end"
              placeholder="VD: 9:30"
              value={form.end_time ?? ''}
              onChange={(e) => set('end_time', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Học kỳ</Label>
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

          <div className="space-y-1.5">
            <Label>Trạng thái</Label>
            <Select
              value={form.status ?? ''}
              onValueChange={(v) => set('status', v as ClassStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <strong className="text-amber-700">{form.day_of_week}</strong>{' '}
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
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className={showDayWarning ? 'bg-amber-600 hover:bg-amber-700' : ''}
          >
            {saving ? 'Đang lưu...' : showDayWarning ? 'Lưu (đã đọc cảnh báo)' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
