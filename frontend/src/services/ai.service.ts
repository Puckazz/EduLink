import apiClient from '@/lib/axios';
import type {
  ChatConversation,
  ChatRequest,
  ChatResponse,
  ChatHistoryResponse,
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

  async getConversations(studentId?: number): Promise<ChatConversation[]> {
    const res = await apiClient.get<ChatConversation[]>('/ai/chat/conversations', {
      params: { studentId },
    });
    return res.data;
  },

  async createConversation(studentId: number, title?: string): Promise<ChatConversation> {
    const res = await apiClient.post<ChatConversation>('/ai/chat/conversations', {
      studentId,
      title,
    });
    return res.data;
  },

  async updateConversation(id: number, title: string): Promise<ChatConversation> {
    const res = await apiClient.patch<ChatConversation>(`/ai/chat/conversations/${id}`, { title });
    return res.data;
  },

  async deleteConversation(id: number): Promise<{ deleted: boolean }> {
    const res = await apiClient.delete<{ deleted: boolean }>(`/ai/chat/conversations/${id}`);
    return res.data;
  },

  async sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
    const res = await apiClient.post<ChatResponse>('/ai/chat', data);
    return res.data;
  },

  async getChatHistory(
    conversationId: number,
    params?: {
      page?: number;
      limit?: number;
    },
  ): Promise<ChatHistoryResponse> {
    const res = await apiClient.get<ChatHistoryResponse>(`/ai/chat/conversations/${conversationId}/history`, {
      params,
    });
    return res.data;
  },

  async clearChatHistory(): Promise<{ deleted: number }> {
    const res = await apiClient.delete<{ deleted: number }>('/ai/chat/history');
    return res.data;
  },

  async clearChatHistoryByStudent(studentId: number): Promise<{ deleted: number }> {
    const res = await apiClient.delete<{ deleted: number }>(`/ai/chat/history/student/${studentId}`);
    return res.data;
  },
};
