'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  ArrowLeft, SendHorizontal, Loader2, FileText, Download,
  Paperclip, X, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useFeedbackMessages } from '@/hooks/queries/useFeedbackMessages';
import { useSendMessage } from '@/hooks/mutations/useSendMessage';
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
import type { Feedback, FeedbackMessage, MessageAttachment } from '@/types/feedback';
import { FEEDBACK_CATEGORY_LABELS, FEEDBACK_STATUS_LABELS } from '@/types/feedback';

function AttachmentList({
  attachments,
  isParent,
}: {
  attachments: MessageAttachment[];
  isParent: boolean;
}) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 w-full ${isParent ? 'justify-end' : 'justify-start'}`}>
      {attachments.map((att) =>
        att.is_image ? (
          <a
            key={att.attachment_id}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block shrink-0"
          >
            <Image
              src={att.url}
              alt={att.file_name}
              width={112}
              height={112}
              className="h-28 w-28 rounded-xl object-cover border border-slate-200 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            />
          </a>
        ) : (
          <a
            key={att.attachment_id}
            href={FeedbackService.getAttachmentDownloadUrl(att.attachment_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50 transition-colors shadow-sm min-w-0 max-w-[200px]"
          >
            <FileText className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-700 min-w-0 flex-1">{att.file_name}</span>
            <Download className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </a>
        ),
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: FeedbackMessage }) {
  const isParent = msg.sender_role === 'PARENT';
  const hasAttachments = msg.attachments && msg.attachments.length > 0;

  return (
    <div className={`flex flex-col w-full min-w-0 ${isParent ? 'items-end' : 'items-start'}`}>
      <div className={`flex gap-2 w-full min-w-0 ${isParent ? 'flex-row-reverse' : 'flex-row'} items-end`}>
        {!isParent && (
          <div className="h-7 w-7 rounded-full bg-[#0b203c] flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-1">
            BM
          </div>
        )}
        <div
          className={`max-w-[75%] min-w-0 px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
            isParent
              ? 'bg-[#0b203c] text-white rounded-br-sm'
              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          <p className={`text-[10px] mt-1 ${isParent ? 'text-white/60 text-right' : 'text-slate-400'}`}>
            {new Date(msg.created_at).toLocaleString('vi-VN', {
              hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit',
            })}
          </p>
        </div>
      </div>

      {hasAttachments && (
        <div className={`flex w-full min-w-0 mt-1.5 ${isParent ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isParent && <div className="w-9 shrink-0" />}
          <div className="max-w-[75%] min-w-0">
            <AttachmentList attachments={msg.attachments!} isParent={isParent} />
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  feedback: Feedback;
  onBack: () => void;
}

export function ParentFeedbackThread({ feedback, onBack }: Props) {
  const [replyText, setReplyText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachedFilesRef = useRef<AttachedFile[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useFeedbackMessages(feedback.feedback_id);
  const { mutate: sendMessage, isPending } = useSendMessage();

  const isUploading = attachedFiles.some((f) => f.uploadState === 'uploading');
  const hasUploadError = attachedFiles.some((f) => f.uploadState === 'error');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        prev.map((f) => f.id === af.id ? { ...f, uploadState: 'error' } : f),
      );
      toast.error(`"${af.file.name}": Upload thất bại. Thử lại.`);
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
      prev.map((f) => f.id === id ? { ...f, uploadState: 'uploading', result: undefined } : f),
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
    if (!replyText.trim() || isPending || isUploading) return;
    const attachments = attachedFiles
      .filter((f) => f.uploadState === 'done' && f.result)
      .map((f) => f.result!);

    sendMessage(
      { feedbackId: feedback.feedback_id, content: replyText.trim(), role: 'parent', attachments },
      {
        onSuccess: () => {
          setReplyText('');
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

  const statusColors = {
    OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    RESOLVED: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-w-0">
      <div className="flex items-start gap-3 p-4 border-b border-slate-100 bg-slate-50/60 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 shrink-0 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 truncate">{feedback.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[11px] text-slate-500">
              {FEEDBACK_CATEGORY_LABELS[feedback.category]}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[feedback.status]}`}>
              {FEEDBACK_STATUS_LABELS[feedback.status]}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 h-[320px] overflow-y-auto overflow-x-hidden">
        <div className="p-4 flex flex-col gap-3 w-full min-w-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => <MessageBubble key={msg.message_id} msg={msg} />)
          ) : (
            <p className="text-center text-sm text-slate-400 py-8">Chưa có tin nhắn nào.</p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {feedback.status !== 'RESOLVED' && (
        <div className="border-t border-slate-100 bg-white">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {attachedFiles.map((af) => (
                <div
                  key={af.id}
                  className={`relative flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs max-w-[200px] transition-colors ${
                    af.uploadState === 'error'
                      ? 'border-red-200 bg-red-50'
                      : af.uploadState === 'done'
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {af.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={af.preview} alt={af.file.name} className="h-7 w-7 rounded object-cover shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-700 text-[11px]">{af.file.name}</p>
                    <p className="text-slate-400 text-[10px]">{formatAttachmentBytes(af.file.size)}</p>
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

          <div className="p-4 flex gap-3 items-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={
                isPending || attachedFiles.length >= FEEDBACK_ATTACHMENT_MAX_FILES
              }
              title={`Đính kèm file (tối đa ${FEEDBACK_ATTACHMENT_MAX_FILES})`}
              className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors shrink-0 disabled:opacity-40"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={FEEDBACK_ATTACHMENT_ACCEPT}
              className="hidden"
              onChange={handleFileChange}
            />

            <Textarea
              placeholder="Nhập thêm thông tin... (Ctrl+Enter để gửi)"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="resize-none border-slate-200 text-sm focus-visible:ring-[#0b203c]/20 flex-1 min-w-0"
            />

            <Button
              onClick={handleSend}
              disabled={!replyText.trim() || isPending || isUploading}
              title={isUploading ? 'Chờ upload hoàn tất' : undefined}
              className="h-10 w-10 p-0 bg-[#0b203c] hover:bg-[#142d52] rounded-xl shrink-0 disabled:opacity-50"
            >
              {isPending || isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </Button>
          </div>

          {(isUploading || hasUploadError) && (
            <p className={`text-[11px] px-4 pb-3 -mt-1 ${hasUploadError ? 'text-red-500' : 'text-amber-500'}`}>
              {isUploading ? '⏳ Đang upload file, vui lòng chờ...' : '❌ Một số file lỗi — nhấn icon đỏ để thử lại hoặc xóa file.'}
            </p>
          )}
        </div>
      )}

      {feedback.status === 'RESOLVED' && (
        <div className="border-t border-slate-100 p-3 bg-green-50 text-center">
          <p className="text-xs text-green-700 font-semibold">Phản hồi này đã được giải quyết</p>
        </div>
      )}
    </div>
  );
}
