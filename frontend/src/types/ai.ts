export type AiNotificationRecipient = 'all' | 'parents' | 'teachers';

export interface GenerateNotificationDraftRequest {
  brief: string;
  recipient?: AiNotificationRecipient;
  isUrgent?: boolean;
}

export interface GenerateNotificationDraftResponse {
  title: string;
  content: string;
}

export interface FeedbackCategoryBreakdown {
  category: string;
  count: number;
}

export interface FeedbackSummaryResponse {
  summary: string;
  urgentCount: number;
  stats: {
    open: number;
    inProgress: number;
    resolved: number;
    total: number;
  };
  analytics: {
    trend: { month: string; total: number; resolved: number }[];
    categoryBreakdown: FeedbackCategoryBreakdown[];
    avgResponseHours: number | null;
    resolutionRate: number;
    totalInPeriod: number;
    respondedCount: number;
  };
  categoryBreakdown: FeedbackCategoryBreakdown[];
  suggestedActions: string[];
}

export interface SuggestFeedbackReplyResponse {
  content: string;
}

export interface ChatConversation {
  conversation_id: number;
  title: string;
  parent_id: number;
  student_id: number | null;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  conversationId: number;
}

export interface ChatResponse {
  reply: string;
  sources: string[];
}

export interface ChatHistoryItem {
  chat_id: number;
  conversation_id: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  created_at: string;
}

export interface ChatHistoryResponse {
  data: ChatHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

