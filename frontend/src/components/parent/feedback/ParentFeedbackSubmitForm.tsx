'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquarePlus,
  Paperclip,
  SendHorizontal,
  X,
} from 'lucide-react';
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
import { FeedbackService } from '@/services/feedback.service';
import {
  FEEDBACK_ATTACHMENT_ACCEPT,
  FEEDBACK_ATTACHMENT_MAX_FILES,
  FEEDBACK_ATTACHMENT_MAX_SIZE_MB,
  createAttachedFile,
  formatAttachmentBytes,
  getAttachmentValidationError,
  releaseAttachedFile,
  releaseAttachedFiles,
  type AttachedFile,
} from '@/lib/feedback-attachments';
import type { FeedbackCategory } from '@/types/feedback';
import { toast } from 'sonner';

interface Props {
  onSuccess?: () => void;
}

export function ParentFeedbackSubmitForm({ onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FeedbackSubjectValue | ''>('');
  const [content, setContent] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachedFilesRef = useRef<AttachedFile[]>([]);

  const { mutate: submitFeedback, isPending } = useSubmitFeedback();

  const maxLength = 1000;
  const isUploading = attachedFiles.some((f) => f.uploadState === 'uploading');
  const hasUploadError = attachedFiles.some((f) => f.uploadState === 'error');
  const isValid =
    title.trim().length >= 5 &&
    category !== '' &&
    content.trim().length >= 20 &&
    !isUploading &&
    !hasUploadError;

  useEffect(() => {
    attachedFilesRef.current = attachedFiles;
  }, [attachedFiles]);

  useEffect(() => {
    return () => {
      void releaseAttachedFiles(attachedFilesRef.current, true);
    };
  }, []);

  const uploadFile = useCallback(async (af: AttachedFile) => {
    try {
      const result = await FeedbackService.preUploadAttachment(af.file);
      setAttachedFiles((prev) =>
        prev.map((f) => (f.id === af.id ? { ...f, uploadState: 'done', result } : f)),
      );
    } catch {
      setAttachedFiles((prev) =>
        prev.map((f) => (f.id === af.id ? { ...f, uploadState: 'error' } : f)),
      );
      toast.error(`"${af.file.name}": Upload thất bại. Vui lòng thử lại.`);
    }
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = FEEDBACK_ATTACHMENT_MAX_FILES - attachedFiles.length;
    const toAdd: AttachedFile[] = [];

    for (const file of files.slice(0, remaining)) {
      const validationError = getAttachmentValidationError(file);
      if (validationError) {
        toast.error(`"${file.name}": ${validationError}`);
        continue;
      }
      toAdd.push(createAttachedFile(file));
    }

    if (toAdd.length > 0) {
      setAttachedFiles((prev) => [...prev, ...toAdd]);
      toAdd.forEach((af) => uploadFile(af));
    }
    e.target.value = '';
  }

  function retryUpload(id: string) {
    const af = attachedFiles.find((f) => f.id === id);
    if (!af) return;
    setAttachedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, uploadState: 'uploading', result: undefined } : f)),
    );
    uploadFile(af);
  }

  function removeFile(id: string) {
    setAttachedFiles((prev) =>
      prev.filter((f) => {
        if (f.id === id) {
          void releaseAttachedFile(f, true);
          return false;
        }
        return true;
      }),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;
    const attachments = attachedFiles
      .filter((f) => f.uploadState === 'done' && f.result)
      .map((f) => f.result!);

    submitFeedback(
      {
        title: title.trim(),
        category: category as FeedbackCategory,
        content: content.trim(),
        attachments,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          void releaseAttachedFiles(attachedFiles);
          attachedFilesRef.current = [];
          setAttachedFiles([]);
          onSuccess?.();
        },
      },
    );
  }

  function handleReset() {
    setTitle('');
    setCategory('');
    setContent('');
    void releaseAttachedFiles(attachedFiles, true);
    attachedFilesRef.current = [];
    setAttachedFiles([]);
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-slate-700">
              File / ảnh đính kèm
            </label>
            <span className="text-xs text-slate-400 font-medium">
              {attachedFiles.length}/{FEEDBACK_ATTACHMENT_MAX_FILES} file
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending || attachedFiles.length >= FEEDBACK_ATTACHMENT_MAX_FILES}
              className="h-10 px-3 rounded-xl border border-slate-200 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-40"
            >
              <Paperclip className="h-4 w-4" />
              Thêm file
            </button>
            <span className="text-xs text-slate-400">
              JPG, PNG, GIF, PDF, DOC, XLS. Tối đa {FEEDBACK_ATTACHMENT_MAX_SIZE_MB}MB/file.
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={FEEDBACK_ATTACHMENT_ACCEPT}
            className="hidden"
            onChange={handleFileChange}
          />
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((af) => (
                <div
                  key={af.id}
                  className={`relative flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs max-w-[240px] transition-colors ${
                    af.uploadState === 'error'
                      ? 'border-red-200 bg-red-50'
                      : af.uploadState === 'done'
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {af.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={af.preview}
                      alt={af.file.name}
                      className="h-8 w-8 rounded object-cover shrink-0"
                    />
                  ) : (
                    <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-700">{af.file.name}</p>
                    <p className="text-slate-400">{formatAttachmentBytes(af.file.size)}</p>
                  </div>
                  {af.uploadState === 'uploading' && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400 shrink-0" />
                  )}
                  {af.uploadState === 'done' && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )}
                  {af.uploadState === 'error' && (
                    <button type="button" onClick={() => retryUpload(af.id)} title="Thử lại">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(af.id)}
                    className="ml-0.5 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {(isUploading || hasUploadError) && (
            <p className={`text-xs font-medium ${hasUploadError ? 'text-red-500' : 'text-amber-500'}`}>
              {isUploading
                ? 'Đang upload file, vui lòng chờ...'
                : 'Một số file upload lỗi. Nhấn biểu tượng đỏ để thử lại hoặc xóa file.'}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={!isValid || isPending}
          title={isUploading ? 'Vui lòng chờ upload hoàn tất' : undefined}
          className="w-full h-11 bg-[#0b203c] hover:bg-[#142d52] text-white font-bold rounded-xl transition-all duration-200 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isUploading ? (
            <>
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isUploading ? 'Đang upload...' : 'Đang gửi...'}
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
