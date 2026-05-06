import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NotificationService } from '@/services/notification.service';
import type { Notification } from '@/types/notification';

type Recipient = 'all' | 'parents' | 'teachers';

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Notification | null;
}

export function NotificationDialog({
  open,
  onOpenChange,
  editingItem,
}: NotificationDialogProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState<Recipient | ''>('');
  const [body, setBody] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const MAX_CHARS = 500;

  useEffect(() => {
    if (editingItem) {
      const isItemUrgent =
        editingItem.title.toLowerCase().includes('khẩn') ||
        editingItem.title.toLowerCase().includes('quan trọng');
      setTitle(editingItem.title.replace(/\[Khẩn cấp\]\s*/i, ''));
      setBody(editingItem.content);
      setIsUrgent(isItemUrgent);
      if (editingItem.target_role === 'parent') setRecipient('parents');
      else if (editingItem.target_role === 'teacher') setRecipient('teachers');
      else setRecipient('all');
    } else {
      setTitle('');
      setRecipient('');
      setBody('');
      setIsUrgent(false);
    }
  }, [editingItem, open]);

  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string; target_role?: string | null }) =>
      NotificationService.create(data),
    onSuccess: () => {
      toast.success('Gửi thông báo thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi gửi thông báo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; title: string; content: string; target_role?: string | null }) =>
      NotificationService.update(data.id, {
        title: data.title,
        content: data.content,
        target_role: data.target_role,
      }),
    onSuccess: () => {
      toast.success('Cập nhật thông báo thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật thông báo');
    },
  });

  const handleSave = () => {
    if (!title.trim() || !recipient || !body.trim()) return;

    const finalTitle = isUrgent ? `[Khẩn cấp] ${title.trim()}` : title.trim();
    const finalTargetRole = recipient === 'parents' ? 'parent' : recipient === 'teachers' ? 'teacher' : null;

    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.notification_id,
        title: finalTitle,
        content: body.trim(),
        target_role: finalTargetRole,
      });
    } else {
      createMutation.mutate({
        title: finalTitle,
        content: body.trim(),
        target_role: finalTargetRole,
      });
    }
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Cập Nhật Thông Báo' : 'Tạo Thông Báo Mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tiêu đề thông báo</Label>
              <Input
                placeholder="VD: Thông báo nghỉ học..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Đối tượng nhận</Label>
              <Select
                value={recipient}
                onValueChange={(val) => setRecipient(val as Recipient)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đối tượng..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="parents">Phụ huynh</SelectItem>
                  <SelectItem value="teachers">Giáo viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nội dung tin nhắn</Label>
            <Textarea
              rows={5}
              placeholder="Nhập nội dung chi tiết tại đây..."
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, MAX_CHARS))}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Hỗ trợ định dạng văn bản cơ bản</span>
              <span>
                {body.length} / {MAX_CHARS} ký tự
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="urgent-checkbox"
                checked={isUrgent}
                onCheckedChange={(checked) => setIsUrgent(checked === true)}
              />
              <Label
                htmlFor="urgent-checkbox"
                className="flex cursor-pointer items-center gap-1.5 text-sm font-medium"
              >
                <AlertTriangle
                  className={`h-4 w-4 ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}
                />
                Đánh dấu Quan trọng / Khẩn cấp
              </Label>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                className="font-medium"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
              >
                Hủy
              </Button>
              <Button
                className="gap-2 font-semibold"
                onClick={handleSave}
                disabled={!title.trim() || !recipient || !body.trim() || isBusy}
              >
                <Send className="h-4 w-4" />
                {editingItem
                  ? updateMutation.isPending
                    ? 'Đang lưu...'
                    : 'Lưu thay đổi'
                  : createMutation.isPending
                    ? 'Đang gửi...'
                    : 'Gửi Thông Báo'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
