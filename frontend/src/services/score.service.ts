import apiClient from '@/lib/axios';
import type {
  Score,
  CreateScoreDto,
  UpdateScoreDto,
  ScoreListQuery,
  ScoreListResponse,
} from '@/types/score';

export const ScoreService = {
  async getScoresByStudent(
    studentId: number,
    query?: ScoreListQuery,
  ): Promise<ScoreListResponse> {
    const res = await apiClient.get<ScoreListResponse>(
      `/students/${studentId}/scores`,
      {
        params: query,
      },
    );
    return res.data;
  },

  async createForStudent(
    studentId: number,
    data: CreateScoreDto,
  ): Promise<Score> {
    const res = await apiClient.post<Score>(
      `/students/${studentId}/scores`,
      data,
    );
    return res.data;
  },

  async getById(id: number): Promise<Score> {
    const res = await apiClient.get<Score>(`/scores/${id}`);
    return res.data;
  },

  async update(id: number, data: UpdateScoreDto): Promise<Score> {
    const res = await apiClient.put<Score>(`/scores/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/scores/${id}`);
  },
};
