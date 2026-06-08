'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateFaq, useUpdateFaq } from '@/hooks/mutations/useFaqMutations';
import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from '@/types/feedback';
import type { Faq, CreateFaqDto } from '@/types/faq';
import {
  defaultFaqFormValues,
  faqFormSchema,
  type FaqFormValues,
} from '@/components/faq/utils/faq-form.schema';

interface FaqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFaq: Faq | null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function getFormFromFaq(faq: Faq): FaqFormValues {
  return {
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    sort_order: faq.sort_order,
    is_active: faq.is_active,
  };
}

export function FaqDialog({ open, onOpenChange, editingFaq }: FaqDialogProps) {
  const isEditing = editingFaq !== null;
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: defaultFaqFormValues,
  });

  const createMutation = useCreateFaq();
  const updateMutation = useUpdateFaq();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      form.reset(editingFaq ? getFormFromFaq(editingFaq) : defaultFaqFormValues);
    }
  }, [open, editingFaq, form]);

  const handleSubmit = (values: FaqFormValues) => {
    const dto: CreateFaqDto = values;

    if (isEditing && editingFaq) {
      updateMutation.mutate(
        { id: editingFaq.faq_id, dto },
        {
          onSuccess: () => {
            toast.success('Cập nhật câu hỏi thành công.');
            onOpenChange(false);
          },
          onError: () => {
            toast.error('Không thể cập nhật câu hỏi. Vui lòng thử lại.');
          },
        },
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => {
          toast.success('Thêm câu hỏi mới thành công.');
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Không thể thêm câu hỏi. Vui lòng thử lại.');
        },
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) form.reset(defaultFaqFormValues);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật nội dung câu hỏi thường gặp.'
              : 'Điền thông tin để tạo câu hỏi thường gặp mới.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="faq-question">
              Câu hỏi <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="faq-question"
              placeholder="Nhập câu hỏi..."
              {...form.register('question')}
              rows={3}
              className="resize-none text-sm"
            />
            <FieldError message={form.formState.errors.question?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="faq-answer">
              Câu trả lời <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="faq-answer"
              placeholder="Nhập câu trả lời..."
              {...form.register('answer')}
              rows={5}
              className="resize-none text-sm"
            />
            <FieldError message={form.formState.errors.answer?.message} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Category */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="faq-category">Chủ đề</Label>
              <Select
                value={form.watch('category')}
                onValueChange={(value) => {
                  form.setValue('category', value as FeedbackCategory, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger id="faq-category" className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(FEEDBACK_CATEGORY_LABELS) as [FeedbackCategory, string][]
                  ).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort order */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="faq-sort-order">Thứ tự hiển thị</Label>
              <Input
                id="faq-sort-order"
                type="number"
                min={0}
                {...form.register('sort_order', { valueAsNumber: true })}
                className="h-9 text-sm"
              />
              <FieldError message={form.formState.errors.sort_order?.message} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="faq-is-active" className="text-sm font-medium">
                Hiển thị cho phụ huynh
              </Label>
              <p className="text-xs text-muted-foreground">
                Bật để câu hỏi xuất hiện trong trang Hỏi đáp của phụ huynh.
              </p>
            </div>
            <Switch
              id="faq-is-active"
              checked={form.watch('is_active')}
              onCheckedChange={(checked) => {
                form.setValue('is_active', checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
          </div>
          </div>

          <DialogFooter>
            <Button
              id="faq-dialog-cancel"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button id="faq-dialog-submit" type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? 'Đang lưu...'
                  : 'Đang thêm...'
                : isEditing
                  ? 'Lưu thay đổi'
                  : 'Thêm câu hỏi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
