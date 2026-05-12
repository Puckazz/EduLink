'use client';

import { useState } from 'react';
import { SendHorizontal, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FEEDBACK_SUBJECTS, type FeedbackSubjectValue } from './data';
import { useSubmitFeedback } from '@/hooks/mutations/useSubmitFeedback';
import type { FeedbackCategory } from '@/types/feedback';

interface Props {
  onSuccess?: () => void;
}

export function ParentFeedbackSubmitForm({ onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FeedbackSubjectValue | ''>('');
  const [content, setContent] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: submitFeedback, isPending } = useSubmitFeedback();

  const maxLength = 1000;
  const isValid =
    title.trim().length >= 5 &&
    category !== '' &&
    content.trim().length >= 20;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;

    submitFeedback(
      {
        title: title.trim(),
        category: category as FeedbackCategory,
        content: content.trim(),
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          onSuccess?.();
        },
      },
    );
  }

  function handleReset() {
    setTitle('');
    setCategory('');
    setContent('');
    setIsSuccess(false);
  }

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex flex-col items-center text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Phản hồi đã được gửi!
          </h2>
          <p className="text-sm text-slate-500 max-w-sm">
            Cảm ơn quý phụ huynh đã liên hệ. Chúng tôi sẽ phản hồi trong vòng
            1–2 ngày làm việc. Quý phụ huynh có thể theo dõi phản hồi ở mục
            lịch sử bên dưới.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          className="mt-2 font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Gửi phản hồi khác
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-start gap-4 p-6 border-b border-slate-100 bg-slate-50/60">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-[#0b203c]/8 flex items-center justify-center">
          <MessageSquarePlus className="h-6 w-6 text-[#0b203c]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-snug">
            Ý Kiến Của Quý Phụ Huynh Là Rất Quan Trọng
          </h2>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Mọi ý kiến đóng góp sẽ giúp chúng tôi cải thiện môi trường học tập
            cho sinh viên. Vui lòng sử dụng biểu mẫu dưới đây để gửi câu hỏi,
            đề xuất hoặc phản ánh trực tiếp đến ban quản lý.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="feedback-title"
            className="text-sm font-semibold text-slate-700"
          >
            Tiêu đề
          </label>
          <Input
            id="feedback-title"
            placeholder="Tóm tắt ngắn gọn nội dung phản hồi..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:ring-[#0b203c]/20 focus-visible:border-[#0b203c]/30"
          />
          {title.trim().length > 0 && title.trim().length < 5 && (
            <p className="text-xs text-amber-600 font-medium">
              Tiêu đề cần ít nhất 5 ký tự
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="feedback-category"
            className="text-sm font-semibold text-slate-700"
          >
            Chủ đề / Lĩnh vực
          </label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as FeedbackSubjectValue)}
          >
            <SelectTrigger
              id="feedback-category"
              className="h-11 border-slate-200 bg-white text-slate-700 font-medium focus:ring-[#0b203c]/20 focus:border-[#0b203c]/30"
            >
              <SelectValue placeholder="Chọn một chủ đề..." />
            </SelectTrigger>
            <SelectContent>
              {FEEDBACK_SUBJECTS.map((s) => (
                <SelectItem key={s.value} value={s.value} className="font-medium">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="feedback-content"
            className="text-sm font-semibold text-slate-700"
          >
            Nội dung tin nhắn
          </label>
          <Textarea
            id="feedback-content"
            placeholder="Vui lòng mô tả chi tiết câu hỏi hoặc ý kiến của quý phụ huynh..."
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
            rows={7}
            className="resize-none border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm leading-relaxed focus-visible:ring-[#0b203c]/20 focus-visible:border-[#0b203c]/30"
          />
          <div className="flex items-center justify-between">
            {content.trim().length > 0 && content.trim().length < 20 && (
              <p className="text-xs text-amber-600 font-medium">
                Nội dung cần ít nhất 20 ký tự
              </p>
            )}
            <span className="ml-auto text-xs text-slate-400 font-medium">
              {content.length} / {maxLength} ký tự
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!isValid || isPending}
          className="w-full h-11 bg-[#0b203c] hover:bg-[#142d52] text-white font-bold rounded-xl transition-all duration-200 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <SendHorizontal className="h-4 w-4" />
              Gửi Phản Hồi
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
