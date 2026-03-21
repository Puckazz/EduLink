import apiClient from "@/lib/axios";
import type { Parent } from "@/types/parent";

export const ParentService = {
  async getAll(): Promise<Parent[]> {
    const res = await apiClient.get<Parent[]>("/parents");
    return res.data;
  },

  async getById(id: number): Promise<Parent> {
    const res = await apiClient.get<Parent>(`/parents/${id}`);
    return res.data;
  },
};
