export const UPLOAD_CONSTANTS = {
  AVATAR: {
    MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_EXTENSIONS: /\.(jpg|jpeg|png|webp|gif)$/i,
    FOLDER: 'edulink/avatars',
    TRANSFORM: {
      width: 400,
      height: 400,
      crop: 'fill' as const,
      gravity: 'face' as const,
      format: 'webp',
    },
  },
  ATTACHMENT: {
    MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIME_TYPES: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    ALLOWED_EXTENSIONS: /\.(jpg|jpeg|png|webp|gif|pdf|doc|docx|xls|xlsx)$/i,
    FOLDER: 'edulink/attachments',
    MAX_COUNT: 3,
  },
} as const;

export const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
