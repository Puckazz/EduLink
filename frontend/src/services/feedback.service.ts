import apiClient from '@/lib/axios';
import type {
  Feedback,
  FeedbackMessage,
  CreateFeedbackDto,
  CreateMessageDto,
  UpdateFeedbackStatusDto,
  PaginatedResponse,
} from '@/types/feedback';

export const FeedbackService = {
  // ── Admin ───────────────────────────────────────────────────────────────
  async getAll(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Feedback>> {
    const res = await apiClient.get<PaginatedResponse<Feedback>>('/feedback', { params });
    return res.data;
  },

  // ── Parent ──────────────────────────────────────────────────────────────
  async getMyFeedbacks(): Promise<Feedback[]> {
    const res = await apiClient.get<Feedback[]>('/feedback/mine');
    return res.data;
  },

  // ── Shared ──────────────────────────────────────────────────────────────
  async getOne(id: number): Promise<Feedback> {
    const res = await apiClient.get<Feedback>(`/feedback/${id}`);
    return res.data;
  },

  async getMessages(feedbackId: number): Promise<FeedbackMessage[]> {
    const res = await apiClient.get<FeedbackMessage[]>(`/feedback/${feedbackId}/messages`);
    return res.data;
  },

  // ── Parent actions ───────────────────────────────────────────────────────
  async create(dto: CreateFeedbackDto): Promise<Feedback> {
    const res = await apiClient.post<Feedback>('/feedback', dto);
    return res.data;
  },

  async sendMessage(feedbackId: number, dto: CreateMessageDto): Promise<FeedbackMessage> {
    const res = await apiClient.post<FeedbackMessage>(`/feedback/${feedbackId}/messages`, dto);
    return res.data;
  },

  // ── Admin actions ────────────────────────────────────────────────────────
  async adminReply(feedbackId: number, dto: CreateMessageDto): Promise<FeedbackMessage> {
    const res = await apiClient.post<FeedbackMessage>(`/feedback/${feedbackId}/reply`, dto);
    return res.data;
  },

  async updateStatus(feedbackId: number, dto: UpdateFeedbackStatusDto): Promise<Feedback> {
    const res = await apiClient.patch<Feedback>(`/feedback/${feedbackId}/status`, dto);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/feedback/${id}`);
  },
};
