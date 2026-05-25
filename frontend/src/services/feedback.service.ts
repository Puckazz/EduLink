import apiClient from '@/lib/axios';
import type {
  Feedback,
  FeedbackMessage,
  FeedbackStats,
  FeedbackAnalytics,
  CreateFeedbackDto,
  CreateMessageDto,
  UpdateFeedbackStatusDto,
  PaginatedResponse,
  PreUploadedAttachment,
} from '@/types/feedback';

export const FeedbackService = {
  async getAll(params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Feedback>> {
    const res = await apiClient.get<PaginatedResponse<Feedback>>('/feedback', { params });
    return res.data;
  },

  async getStats(): Promise<FeedbackStats> {
    const res = await apiClient.get<FeedbackStats>('/feedback/stats');
    return res.data;
  },

  async getAnalytics(): Promise<FeedbackAnalytics> {
    const res = await apiClient.get<FeedbackAnalytics>('/feedback/analytics');
    return res.data;
  },

  async getExportData(params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<Feedback[]> {
    const res = await apiClient.get<Feedback[]>('/feedback/export', { params });
    return res.data;
  },

  async getMyFeedbacks(): Promise<Feedback[]> {
    const res = await apiClient.get<Feedback[]>('/feedback/mine');
    return res.data;
  },

  async getOne(id: number): Promise<Feedback> {
    const res = await apiClient.get<Feedback>(`/feedback/${id}`);
    return res.data;
  },

  async getMessages(feedbackId: number): Promise<FeedbackMessage[]> {
    const res = await apiClient.get<FeedbackMessage[]>(`/feedback/${feedbackId}/messages`);
    return res.data;
  },

  getAttachmentDownloadUrl(attachmentId: number): string {
    const base = (apiClient.defaults.baseURL ?? '').replace(/\/$/, '');
    return `${base}/feedback/attachments/${attachmentId}/download`;
  },

  async create(dto: CreateFeedbackDto): Promise<Feedback> {
    const res = await apiClient.post<Feedback>('/feedback', dto);
    return res.data;
  },

  async preUploadAttachment(file: File): Promise<PreUploadedAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<PreUploadedAttachment>(
      '/feedback/attachments/pre-upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },

  async deletePreUploadedAttachment(publicId: string, isImage: boolean): Promise<void> {
    await apiClient.delete('/feedback/attachments/pre-upload', {
      data: { public_id: publicId, is_image: isImage },
    });
  },

  async sendMessage(
    feedbackId: number,
    dto: CreateMessageDto,
  ): Promise<FeedbackMessage> {
    const res = await apiClient.post<FeedbackMessage>(`/feedback/${feedbackId}/messages`, dto);
    return res.data;
  },

  async adminReply(
    feedbackId: number,
    dto: CreateMessageDto,
  ): Promise<FeedbackMessage> {
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
