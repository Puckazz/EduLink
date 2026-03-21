import apiClient from "@/lib/axios";
import type { Feedback, CreateFeedbackDto } from "@/types/feedback";

export const FeedbackService = {
  async getAll(): Promise<Feedback[]> {
    const res = await apiClient.get<Feedback[]>("/feedbacks");
    return res.data;
  },

  async getByParent(parentId: number): Promise<Feedback[]> {
    const res = await apiClient.get<Feedback[]>(
      `/feedbacks/parent/${parentId}`,
    );
    return res.data;
  },

  async create(data: CreateFeedbackDto): Promise<Feedback> {
    const res = await apiClient.post<Feedback>("/feedbacks", data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/feedbacks/${id}`);
  },
};
