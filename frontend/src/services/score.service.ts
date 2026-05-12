import apiClient from '@/lib/axios';
import type {
  Score,
  ScoreListQuery,
  ScoreListResponse,
  CreateScoreDto,
  UpdateScoreDto,
  ScorebookRow,
  ScorebookQuery,
  BulkUpdateScoreDto,
  BulkPublishDto,
  ScoreLogEntry,
} from '@/types/score';

export const ScoreService = {
  async getScorebook(query: ScorebookQuery): Promise<ScorebookRow[]> {
    const res = await apiClient.get<ScorebookRow[]>('/scores/scorebook', {
      params: query,
    });
    return res.data;
  },

  async bulkUpdate(dto: BulkUpdateScoreDto): Promise<{ updated: number }> {
    const res = await apiClient.post<{ updated: number }>('/scores/bulk-update', dto);
    return res.data;
  },

  async bulkPublish(dto: BulkPublishDto): Promise<{ updated: number; status: string }> {
    const res = await apiClient.patch<{ updated: number; status: string }>(
      '/scores/bulk-publish',
      dto,
    );
    return res.data;
  },

  async getLogs(limit = 50): Promise<ScoreLogEntry[]> {
    const res = await apiClient.get<ScoreLogEntry[]>('/scores/logs', {
      params: { limit },
    });
    return res.data;
  },

  async getScoresByStudent(
    studentId: number,
    query?: ScoreListQuery,
  ): Promise<ScoreListResponse> {
    const res = await apiClient.get<ScoreListResponse>(
      `/students/${studentId}/scores`,
      { params: query },
    );
    return res.data;
  },

  async createForStudent(studentId: number, data: CreateScoreDto): Promise<Score> {
    const res = await apiClient.post<Score>(`/students/${studentId}/scores`, data);
    return res.data;
  },

  async getById(id: number): Promise<Score> {
    const res = await apiClient.get<Score>(`/scores/${id}`);
    return res.data;
  },

  async update(id: number, data: UpdateScoreDto): Promise<Score> {
    const res = await apiClient.patch<Score>(`/scores/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/scores/${id}`);
  },

  async getScoresByStudentForParent(
    studentId: number,
    query?: ScoreListQuery,
  ): Promise<ScoreListResponse> {
    const res = await apiClient.get<ScoreListResponse>(
      `/me/students/${studentId}/scores`,
      { params: query },
    );
    return res.data;
  },
};
