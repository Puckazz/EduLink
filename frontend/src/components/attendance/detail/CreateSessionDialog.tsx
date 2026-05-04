'use client';

import { useState } from 'react';
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
import { ClassSectionService, type AttendanceSession } from '@/services/attendance.service';

interface Props {
  open: boolean;
  sectionId: number;
  nextSessionNo: number; // tự điền sẵn số buổi tiếp theo
  onClose: () => void;
  onCreated: (session: AttendanceSession) => void;
}

export function CreateSessionDialog({
  open,
  sectionId,
  nextSessionNo,
  onClose,
  onCreated,
}: Props) {
  const [sessionDate, setSessionDate] = useState('');
  const [sessionNo, setSessionNo] = useState(nextSessionNo);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset khi mở lại
  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setSessionDate('');
      setSessionNo(nextSessionNo);
      setNote('');
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!sessionDate) return toast.error('Vui lòng chọn ngày buổi học.');
    if (!sessionNo || sessionNo < 1) return toast.error('Số buổi phải lớn hơn 0.');

    setSaving(true);
    try {
      const created = await ClassSectionService.createSession(sectionId, {
        session_date: sessionDate,
        session_no: sessionNo,
        note: note.trim() || undefined,
      });
      toast.success(`Đã tạo Buổi ${sessionNo} (${sessionDate}) thành công.`);
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

        <div className="space-y-4 py-2">
          {/* Số buổi */}
          <div className="space-y-1.5">
            <Label htmlFor="session_no">
              Buổi số <span className="text-red-500">*</span>
            </Label>
            <Input
              id="session_no"
              type="number"
              min={1}
              value={sessionNo}
              onChange={(e) => setSessionNo(Number(e.target.value))}
            />
            <p className="text-xs text-slate-400">
              Hệ thống đề xuất Buổi {nextSessionNo} (buổi tiếp theo chưa có)
            </p>
          </div>

          {/* Ngày */}
          <div className="space-y-1.5">
            <Label htmlFor="session_date">
              Ngày buổi học <span className="text-red-500">*</span>
            </Label>
            <Input
              id="session_date"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <Label htmlFor="session_note">Ghi chú (tuỳ chọn)</Label>
            <Textarea
              id="session_note"
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
            {saving ? 'Đang tạo...' : 'Tạo buổi học'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
