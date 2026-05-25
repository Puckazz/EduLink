import { FeedbackService } from '@/services/feedback.service';
import type { PreUploadedAttachment } from '@/types/feedback';

export const FEEDBACK_ATTACHMENT_MAX_FILES = 3;
export const FEEDBACK_ATTACHMENT_MAX_SIZE_MB = 10;
export const FEEDBACK_ATTACHMENT_ACCEPT =
  '.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx';

const FEEDBACK_ATTACHMENT_ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const FEEDBACK_ATTACHMENT_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export type UploadState = 'uploading' | 'done' | 'error';

export interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  uploadState: UploadState;
  result?: PreUploadedAttachment;
}

export function formatAttachmentBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function getAttachmentValidationError(file: File): string | null {
  if (!FEEDBACK_ATTACHMENT_ALLOWED_TYPES.has(file.type)) {
    return 'Định dạng không được hỗ trợ.';
  }
  if (file.size > FEEDBACK_ATTACHMENT_MAX_SIZE_MB * 1024 * 1024) {
    return `Vượt quá ${FEEDBACK_ATTACHMENT_MAX_SIZE_MB}MB.`;
  }
  return null;
}

export function createAttachedFile(file: File): AttachedFile {
  return {
    id: `${Date.now()}-${Math.random()}`,
    file,
    preview: FEEDBACK_ATTACHMENT_IMAGE_TYPES.has(file.type)
      ? URL.createObjectURL(file)
      : undefined,
    uploadState: 'uploading',
  };
}

export function releaseAttachedFilePreview(file: AttachedFile) {
  if (file.preview) {
    URL.revokeObjectURL(file.preview);
  }
}

export async function releaseAttachedFile(
  file: AttachedFile,
  deleteRemote = false,
): Promise<void> {
  releaseAttachedFilePreview(file);
  if (deleteRemote && file.uploadState === 'done' && file.result) {
    await FeedbackService.deletePreUploadedAttachment(
      file.result.public_id,
      file.result.is_image,
    );
  }
}

export async function releaseAttachedFiles(
  files: AttachedFile[],
  deleteRemote = false,
): Promise<void> {
  await Promise.allSettled(files.map((file) => releaseAttachedFile(file, deleteRemote)));
}
