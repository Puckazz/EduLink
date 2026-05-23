import apiClient from '@/lib/axios';
import type {
  AcademicPeriodStatus,
  AcademicTerm,
} from '@/types/academic-term';

export interface CreateAcademicTermDto {
  code: AcademicTerm['code'];
  academic_year_id: number;
  name?: string;
  start_date: string;
  end_date: string;
  status?: AcademicPeriodStatus;
}

export type UpdateAcademicTermDto = Partial<CreateAcademicTermDto>;

export interface AcademicTermQuery {
  academicYearId?: number;
  status?: AcademicPeriodStatus;
}

export const AcademicTermService = {
  async getAll(query: AcademicTermQuery = {}): Promise<AcademicTerm[]> {
    const res = await apiClient.get<AcademicTerm[]>('/academic-terms', {
      params: {
        ...(query.academicYearId ? { academic_year_id: query.academicYearId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
    });
    return res.data;
  },

  async getActive(): Promise<AcademicTerm> {
    const res = await apiClient.get<AcademicTerm>('/academic-terms/active');
    return res.data;
  },

  async create(dto: CreateAcademicTermDto): Promise<AcademicTerm> {
    const res = await apiClient.post<AcademicTerm>('/academic-terms', dto);
    return res.data;
  },

  async update(id: number, dto: UpdateAcademicTermDto): Promise<AcademicTerm> {
    const res = await apiClient.patch<AcademicTerm>(`/academic-terms/${id}`, dto);
    return res.data;
  },

  async activate(id: number): Promise<AcademicTerm> {
    const res = await apiClient.patch<AcademicTerm>(`/academic-terms/${id}/activate`);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/academic-terms/${id}`);
  },
};
