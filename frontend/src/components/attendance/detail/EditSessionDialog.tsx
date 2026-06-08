'use client';

import { useEffect, useState } from 'react';
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

interface Props {
  open: boolean;
  session: AttendanceSession;
  sectionId: number;
  onClose: () => void;
  onUpdated: (session: AttendanceSession) => void;
}

export function EditSessionDialog({ open, session, sectionId, onClose, onUpdated }: Props) {
  const [sessionDate, setSessionDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const raw = session.session_date;
    setSessionDate(raw ? raw.slice(0, 10) : '');
    setNote(session.note ?? '');
  }, [open, session]);

  const handleSubmit = async () => {
    if (!sessionDate) return toast.error('Vui lòng chọn ngày buổi học.');

    setSaving(true);
    try {
      const updated = await ClassSectionService.updateSession(sectionId, session.session_id, {
        session_date: sessionDate,
        note: note.trim() || undefined,
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

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit_session_date">
              Ngày buổi học <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_session_date"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_session_note">Ghi chú (tuỳ chọn)</Label>
            <Textarea
              id="edit_session_note"
              placeholder="VD: Học bù, thi giữa kỳ..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
