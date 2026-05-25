'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SendHorizontal, Loader2, Sparkles, Paperclip, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSendMessage } from '@/hooks/mutations/useSendMessage';
import { AiService } from '@/services/ai.service';
import { FeedbackService } from '@/services/feedback.service';
import {
  FEEDBACK_ATTACHMENT_ACCEPT,
  FEEDBACK_ATTACHMENT_MAX_FILES,
  createAttachedFile,
  formatAttachmentBytes,
  getAttachmentValidationError,
  releaseAttachedFile,
  releaseAttachedFiles,
  type AttachedFile,
} from '@/lib/feedback-attachments';

interface Props {
  feedbackId: number;
  isResolved: boolean;
}

export function FeedbackReplyBox({ feedbackId, isResolved }: Props) {
  const [content, setContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachedFilesRef = useRef<AttachedFile[]>([]);

  const { mutate: sendMessage, isPending } = useSendMessage();
  const suggestReplyMutation = useMutation({
    mutationFn: () => AiService.suggestFeedbackReply(feedbackId),
    onSuccess: (draft) => {
      setContent(draft.content);
      toast.success('Đã tạo gợi ý trả lời bằng AI');
    },
    onError: () => {
      toast.error('Không thể tạo gợi ý AI. Nội dung hiện tại vẫn được giữ nguyên.');
    },
  });

  const isUploading = attachedFiles.some((f) => f.uploadState === 'uploading');
  const hasUploadError = attachedFiles.some((f) => f.uploadState === 'error');

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
        prev.map((f) => f.id === af.id ? { ...f, uploadState: 'done', result } : f),
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
    setAttachedFiles((prev) => {
      const next = prev.filter((f) => {
        if (f.id === id) {
          void releaseAttachedFile(f, true);
          return false;
        }
        return true;
      });
      return next;
    });
  }

  function handleSend() {
    if (!content.trim() || isPending || isUploading) return;
    const attachments = attachedFiles
      .filter((f) => f.uploadState === 'done' && f.result)
      .map((f) => f.result!);

    sendMessage(
      { feedbackId, content: content.trim(), role: 'admin', attachments },
      {
        onSuccess: () => {
          setContent('');
          void releaseAttachedFiles(attachedFiles);
          attachedFilesRef.current = [];
          setAttachedFiles([]);
        },
      },
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  if (isResolved) {
    return (
      <div className="shrink-0 px-6 py-3 border-t border-border bg-emerald-500/10 text-center">
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Phản hồi này đã được đánh dấu là giải quyết xong
        </p>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-border bg-card px-6 py-4">
      <div className="flex gap-3 items-start">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border">
          <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
            <span className="font-bold text-xs">BM</span>
          </div>
        </div>

        <div className="flex-1 border border-border rounded-xl bg-card overflow-hidden focus-within:ring-1 focus-within:ring-ring transition-shadow">
          <Textarea
            placeholder="Nhập nội dung trả lời tại đây... (Ctrl+Enter để gửi)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-4 text-sm font-medium placeholder:text-muted-foreground"
          />

          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {attachedFiles.map((af) => (
                <div
                  key={af.id}
                  className={`relative flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs max-w-[220px] transition-colors ${af.uploadState === 'error'
                      ? 'border-destructive/50 bg-destructive/5'
                      : af.uploadState === 'done'
                        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                        : 'border-border bg-muted/50'
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
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{af.file.name}</p>
                    <p className="text-muted-foreground">{formatAttachmentBytes(af.file.size)}</p>
                  </div>

                  {af.uploadState === 'uploading' && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
                  )}
                  {af.uploadState === 'done' && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )}
                  {af.uploadState === 'error' && (
                    <button
                      type="button"
                      title="Thử lại"
                      onClick={() => retryUpload(af.id)}
                      className="shrink-0"
                    >
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeFile(af.id)}
                    className="ml-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between p-3 border-t border-border bg-card gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                id="reply-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  isPending || attachedFiles.length >= FEEDBACK_ATTACHMENT_MAX_FILES
                }
                title={`Đính kèm file (tối đa ${FEEDBACK_ATTACHMENT_MAX_FILES})`}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={FEEDBACK_ATTACHMENT_ACCEPT}
                className="hidden"
                onChange={handleFileChange}
              />
              {attachedFiles.length > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  {attachedFiles.length}/{FEEDBACK_ATTACHMENT_MAX_FILES} file
                  {isUploading && <span className="ml-1 text-amber-500">• đang upload...</span>}
                  {!isUploading && hasUploadError && <span className="ml-1 text-destructive">• lỗi upload</span>}
                </span>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => suggestReplyMutation.mutate()}
                disabled={suggestReplyMutation.isPending || isPending}
                className="font-bold gap-2"
              >
                {suggestReplyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {suggestReplyMutation.isPending ? 'Đang gợi ý...' : 'Gợi ý AI'}
              </Button>
            </div>

            <Button
              onClick={handleSend}
              disabled={!content.trim() || isPending || isUploading}
              className="font-bold gap-2 disabled:opacity-50"
              title={isUploading ? 'Vui lòng chờ upload hoàn tất' : undefined}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  Gửi phản hồi
                  <SendHorizontal className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
