'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CalendarIcon } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { ClassSectionService } from '@/services/attendance.service';
import type { AttendanceSession } from '@/types/attendance';
import {
  defaultSessionFormValues,
  sessionFormSchema,
  type SessionFormValues,
} from '@/components/attendance/utils/session-form.schema';

interface Props {
  open: boolean;
  sectionId: number;
  nextSessionNo: number;
  onClose: () => void;
  onCreated: (session: AttendanceSession) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function CreateSessionDialog({
  open,
  sectionId,
  nextSessionNo,
  onClose,
  onCreated,
}: Props) {
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      ...defaultSessionFormValues,
      session_no: nextSessionNo,
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.reset({
      ...defaultSessionFormValues,
      session_no: nextSessionNo,
    });
  }, [open, nextSessionNo, form]);

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      form.reset({
        ...defaultSessionFormValues,
        session_no: nextSessionNo,
      });
      onClose();
    }
  };

  const handleSubmit = async (values: SessionFormValues) => {
    setSaving(true);
    try {
      const created = await ClassSectionService.createSession(sectionId, {
        session_date: values.session_date,
        session_no: values.session_no,
        note: values.note || undefined,
      });
      toast.success(`Đã tạo Buổi ${values.session_no} (${values.session_date}) thành công.`);
      onCreated(created);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Tạo buổi học thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-slate-500" />
            Thêm buổi học mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="session_no">
                Buổi số <span className="text-red-500">*</span>
              </Label>
              <Input
                id="session_no"
                type="number"
                min={1}
                {...form.register('session_no', { valueAsNumber: true })}
              />
              <p className="text-xs text-slate-400">
                Hệ thống đề xuất Buổi {nextSessionNo} (buổi tiếp theo chưa có)
              </p>
              <FieldError message={form.formState.errors.session_no?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="session_date">
                Ngày buổi học <span className="text-red-500">*</span>
              </Label>
              <Input
                id="session_date"
                type="date"
                {...form.register('session_date')}
              />
              <FieldError message={form.formState.errors.session_date?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="session_note">Ghi chú (tuỳ chọn)</Label>
              <Textarea
                id="session_note"
                placeholder="VD: Học bù, thi giữa kỳ..."
                rows={2}
                {...form.register('note')}
              />
              <FieldError message={form.formState.errors.note?.message} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Đang tạo...' : 'Tạo buổi học'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
