import apiClient from "@/lib/axios";
import type { Score, CreateScoreDto, UpdateScoreDto } from "@/types/score";

export const ScoreService = {
  async getScoresByStudent(studentId: number): Promise<Score[]> {
    const res = await apiClient.get<Score[]>(`/scores/student/${studentId}`);
    return res.data;
  },

  async getAllScores(): Promise<Score[]> {
    const res = await apiClient.get<Score[]>("/scores");
    return res.data;
  },

  async createScore(data: CreateScoreDto): Promise<Score> {
    const res = await apiClient.post<Score>("/scores", data);
    return res.data;
  },

  async updateScore(id: number, data: UpdateScoreDto): Promise<Score> {
    const res = await apiClient.patch<Score>(`/scores/${id}`, data);
    return res.data;
  },

  async deleteScore(id: number): Promise<void> {
    await apiClient.delete(`/scores/${id}`);
  },
};
