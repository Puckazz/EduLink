import apiClient from '@/lib/axios';
import type { AcademicPeriodStatus, AcademicYear } from '@/types/academic-term';

export interface CreateAcademicYearDto {
  name: string;
  start_date: string;
  end_date: string;
}

export type UpdateAcademicYearDto = Partial<CreateAcademicYearDto>;

export const AcademicYearService = {
  async getAll(effectiveStatus?: AcademicPeriodStatus): Promise<AcademicYear[]> {
    const res = await apiClient.get<AcademicYear[]>('/academic-years', {
      params: effectiveStatus ? { effectiveStatus } : undefined,
    });
    return res.data;
  },

  async getOne(id: number): Promise<AcademicYear> {
    const res = await apiClient.get<AcademicYear>(`/academic-years/${id}`);
    return res.data;
  },

  async create(dto: CreateAcademicYearDto): Promise<AcademicYear> {
    const res = await apiClient.post<AcademicYear>('/academic-years', dto);
    return res.data;
  },

  async update(id: number, dto: UpdateAcademicYearDto): Promise<AcademicYear> {
    const res = await apiClient.patch<AcademicYear>(`/academic-years/${id}`, dto);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/academic-years/${id}`);
  },
};
