'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
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
  sessionFormSchema,
  type SessionFormValues,
} from '@/components/attendance/utils/session-form.schema';

interface Props {
  open: boolean;
  session: AttendanceSession;
  sectionId: number;
  onClose: () => void;
  onUpdated: (session: AttendanceSession) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function EditSessionDialog({ open, session, sectionId, onClose, onUpdated }: Props) {
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      session_date: '',
      session_no: session.session_no,
      note: '',
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const raw = session.session_date;
    form.reset({
      session_date: raw ? raw.slice(0, 10) : '',
      session_no: session.session_no,
      note: session.note ?? '',
    });
  }, [open, session, form]);

  const handleSubmit = async (values: SessionFormValues) => {
    setSaving(true);
    try {
      const updated = await ClassSectionService.updateSession(sectionId, session.session_id, {
        session_date: values.session_date,
        note: values.note || undefined,
      });
      toast.success(`Đã cập nhật Buổi ${session.session_no}.`);
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Cập nhật buổi học thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Pencil className="h-4 w-4 text-slate-500" />
            Sửa Buổi {session.session_no}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit_session_date">
                Ngày buổi học <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_session_date"
                type="date"
                {...form.register('session_date')}
              />
              <FieldError message={form.formState.errors.session_date?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_session_note">Ghi chú (tuỳ chọn)</Label>
              <Textarea
                id="edit_session_note"
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
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
