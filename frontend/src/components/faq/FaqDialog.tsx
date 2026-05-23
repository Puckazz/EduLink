'use client';

import { useEffect, useState } from 'react';
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

interface FaqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFaq: Faq | null;
}

const DEFAULT_FORM: CreateFaqDto = {
  question: '',
  answer: '',
  category: 'KHAC',
  sort_order: 0,
  is_active: true,
};

function getFormFromFaq(faq: Faq): CreateFaqDto {
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
  const [form, setForm] = useState<CreateFaqDto>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateFaqDto, string>>>({});

  const createMutation = useCreateFaq();
  const updateMutation = useUpdateFaq();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Sync form when dialog opens or editingFaq changes
  useEffect(() => {
    if (open) {
      setForm(editingFaq ? getFormFromFaq(editingFaq) : DEFAULT_FORM);
      setErrors({});
    }
  }, [open, editingFaq]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateFaqDto, string>> = {};
    if (form.question.trim().length < 5) {
      newErrors.question = 'Câu hỏi phải có ít nhất 5 ký tự.';
    }
    if (form.answer.trim().length < 10) {
      newErrors.answer = 'Câu trả lời phải có ít nhất 10 ký tự.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const dto: CreateFaqDto = {
      ...form,
      question: form.question.trim(),
      answer: form.answer.trim(),
    };

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
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        <div className="flex flex-col gap-5 py-2">
          {/* Question */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="faq-question">
              Câu hỏi <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="faq-question"
              placeholder="Nhập câu hỏi..."
              value={form.question}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, question: e.target.value }));
                if (errors.question) setErrors((prev) => ({ ...prev, question: undefined }));
              }}
              rows={3}
              className="resize-none text-sm"
            />
            {errors.question && (
              <p className="text-xs text-destructive">{errors.question}</p>
            )}
          </div>

          {/* Answer */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="faq-answer">
              Câu trả lời <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="faq-answer"
              placeholder="Nhập câu trả lời..."
              value={form.answer}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, answer: e.target.value }));
                if (errors.answer) setErrors((prev) => ({ ...prev, answer: undefined }));
              }}
              rows={5}
              className="resize-none text-sm"
            />
            {errors.answer && (
              <p className="text-xs text-destructive">{errors.answer}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Category */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="faq-category">Chủ đề</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, category: v as FeedbackCategory }))
                }
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
                value={form.sort_order ?? 0}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sort_order: Math.max(0, parseInt(e.target.value, 10) || 0),
                  }))
                }
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Is active toggle */}
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
              checked={form.is_active ?? true}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, is_active: checked }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            id="faq-dialog-cancel"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            id="faq-dialog-submit"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending
              ? isEditing
                ? 'Đang lưu...'
                : 'Đang thêm...'
              : isEditing
                ? 'Lưu thay đổi'
                : 'Thêm câu hỏi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
