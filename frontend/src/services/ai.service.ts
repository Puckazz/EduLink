import apiClient from '@/lib/axios';
import type {
  FeedbackSummaryResponse,
  GenerateNotificationDraftRequest,
  GenerateNotificationDraftResponse,
  SuggestFeedbackReplyResponse,
} from '@/types/ai';

export const AiService = {
  async generateNotificationDraft(
    data: GenerateNotificationDraftRequest,
  ): Promise<GenerateNotificationDraftResponse> {
    const res = await apiClient.post<GenerateNotificationDraftResponse>('/ai/notification/generate', data);
    return res.data;
  },

  async getFeedbackSummary(params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<FeedbackSummaryResponse> {
    const res = await apiClient.get<FeedbackSummaryResponse>('/ai/feedback/summary', { params });
    return res.data;
  },

  async suggestFeedbackReply(feedbackId: number): Promise<SuggestFeedbackReplyResponse> {
    const res = await apiClient.post<SuggestFeedbackReplyResponse>(`/ai/feedback/${feedbackId}/suggest-reply`);
    return res.data;
  },
};
