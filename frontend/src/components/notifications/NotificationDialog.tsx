import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AlertTriangle, Loader2, Send, Sparkles } from 'lucide-react';
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
import { AiService } from '@/services/ai.service';
import type { Notification } from '@/types/notification';
import {
  defaultNotificationFormValues,
  notificationFormSchema,
  type NotificationFormValues,
  type NotificationRecipient,
} from '@/components/notifications/utils/notification-form.schema';

const MAX_CHARS = 500;

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

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: defaultNotificationFormValues,
  });
  const [aiBrief, setAiBrief] = useState('');

  const recipient = form.watch('recipient');
  const body = form.watch('body');
  const isUrgent = form.watch('isUrgent');

  useEffect(() => {
    if (editingItem) {
      const isItemUrgent =
        editingItem.title.toLowerCase().includes('khẩn') ||
        editingItem.title.toLowerCase().includes('quan trọng');
      form.reset({
        title: editingItem.title.replace(/\[Khẩn cấp\]\s*/i, ''),
        body: editingItem.content,
        isUrgent: isItemUrgent,
        recipient:
          editingItem.target_role === 'parent'
            ? 'parents'
            : editingItem.target_role === 'teacher'
              ? 'teachers'
              : 'all',
      });
      setAiBrief('');
    } else {
      form.reset(defaultNotificationFormValues);
      setAiBrief('');
    }
  }, [editingItem, open, form]);

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

  const generateDraftMutation = useMutation({
    mutationFn: () =>
      AiService.generateNotificationDraft({
        brief: aiBrief.trim(),
        recipient,
        isUrgent,
      }),
    onSuccess: (draft) => {
      form.setValue('title', draft.title, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue('body', draft.content.slice(0, MAX_CHARS), {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success('Đã tạo nháp thông báo bằng AI');
    },
    onError: () => {
      toast.error('Không thể tạo nháp AI. Nội dung hiện tại vẫn được giữ nguyên.');
    },
  });

  const handleSave = (values: NotificationFormValues) => {
    const finalTitle = values.isUrgent ? `[Khẩn cấp] ${values.title}` : values.title;
    const finalTargetRole = values.recipient === 'parents' ? 'parent' : values.recipient === 'teachers' ? 'teacher' : null;

    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.notification_id,
        title: finalTitle,
        content: values.body,
        target_role: finalTargetRole,
      });
    } else {
      createMutation.mutate({
        title: finalTitle,
        content: values.body,
        target_role: finalTargetRole,
      });
    }
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;
  const isGeneratingDraft = generateDraftMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Cập Nhật Thông Báo' : 'Tạo Thông Báo Mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSave)} className="grid gap-6 py-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="ai-brief">Ý chính cho AI</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  AI chỉ tạo nháp tiêu đề và nội dung. Admin vẫn cần kiểm tra trước khi gửi.
                </p>
              </div>
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <Textarea
              id="ai-brief"
              rows={3}
              placeholder="VD: Thông báo lịch thi cuối kỳ HK1 bắt đầu từ 15/6, phụ huynh theo dõi phòng thi trên portal..."
              value={aiBrief}
              onChange={(e) => setAiBrief(e.target.value)}
              className="resize-none bg-background"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="gap-2 font-semibold"
                disabled={!aiBrief.trim() || isGeneratingDraft || isBusy}
                onClick={() => generateDraftMutation.mutate()}
              >
                {isGeneratingDraft ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isGeneratingDraft ? 'Đang tạo...' : 'Tạo với AI'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tiêu đề thông báo</Label>
              <Input
                placeholder="VD: Thông báo nghỉ học..."
                {...form.register('title')}
              />
              {form.formState.errors.title?.message && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Đối tượng nhận</Label>
              <Select
                value={recipient}
                onValueChange={(value) => {
                  form.setValue('recipient', value as NotificationRecipient, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
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
              {form.formState.errors.recipient?.message && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.recipient.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nội dung tin nhắn</Label>
            <Textarea
              rows={5}
              placeholder="Nhập nội dung chi tiết tại đây..."
              value={body}
              onChange={(e) => {
                form.setValue('body', e.target.value.slice(0, MAX_CHARS), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              className="resize-none"
            />
            {form.formState.errors.body?.message && (
              <p className="text-xs text-destructive">
                {form.formState.errors.body.message}
              </p>
            )}
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
                onCheckedChange={(checked) => {
                  form.setValue('isUrgent', checked === true, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
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
                type="button"
                className="font-medium"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="gap-2 font-semibold"
                disabled={isBusy}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
