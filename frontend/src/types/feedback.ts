import type { Parent } from './parent';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type FeedbackStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export type FeedbackCategory =
  | 'HOC_TAP'
  | 'TAI_CHINH'
  | 'THOI_KHOA_BIEU'
  | 'KY_LUAT'
  | 'KY_TUC_XA'
  | 'SUC_KHOE'
  | 'HOAT_DONG'
  | 'KHAC';

export type MessageSenderRole = 'PARENT' | 'ADMIN';

export interface MessageAttachment {
  attachment_id: number;
  url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  is_image: boolean;
}

export interface FeedbackMessage {
  message_id: number;
  content: string;
  sender_role: MessageSenderRole;
  sender_id: number;
  created_at: string;
  feedback_id: number;
  attachments?: MessageAttachment[];
}

export interface FeedbackStudent {
  student_id: number;
  student_code: string;
  full_name: string;
  class?: string;
}

export interface Feedback {
  feedback_id: number;
  title: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: number;
  student_id?: number | null;
  parent?: Pick<Parent, 'parent_id' | 'full_name' | 'phone' | 'email'>;
  student?: FeedbackStudent | null;
  messages?: FeedbackMessage[];
}

export interface CreateFeedbackDto {
  title: string;
  category: FeedbackCategory;
  content: string;
  student_id?: number;
  attachments?: PreUploadedAttachment[];
}

export interface CreateMessageDto {
  content: string;
  attachments?: PreUploadedAttachment[];
}

export interface UpdateFeedbackStatusDto {
  status: FeedbackStatus;
}

export interface FeedbackStats {
  open: number;
  inProgress: number;
  resolved: number;
  total: number;
}

export interface FeedbackAnalytics {
  trend: { month: string; total: number; resolved: number }[];
  categoryBreakdown: { category: string; count: number }[];
  avgResponseHours: number | null;
  resolutionRate: number;
  totalInPeriod: number;
  respondedCount: number;
}

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  HOC_TAP: 'Học tập & Điểm số',
  TAI_CHINH: 'Tài chính & Học phí',
  THOI_KHOA_BIEU: 'Thời khóa biểu',
  KY_LUAT: 'Kỷ luật',
  KY_TUC_XA: 'Ký túc xá',
  SUC_KHOE: 'Sức khỏe',
  HOAT_DONG: 'Hoạt động ngoại khóa',
  KHAC: 'Khác',
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  OPEN: 'Chờ xử lý',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã giải quyết',
};

export interface PreUploadedAttachment {
  url: string;
  public_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  is_image: boolean;
}
