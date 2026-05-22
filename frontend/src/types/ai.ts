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
