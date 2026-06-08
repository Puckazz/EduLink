import apiClient from '@/lib/axios';
import type {
  AcademicTerm,
  AcademicTermQuery,
  CreateAcademicTermDto,
  UpdateAcademicTermDto,
} from '@/types/academic-term';

export const AcademicTermService = {
  async getAll(query: AcademicTermQuery = {}): Promise<AcademicTerm[]> {
    const res = await apiClient.get<AcademicTerm[]>('/academic-terms', {
      params: {
        ...(query.academicYearId ? { academic_year_id: query.academicYearId } : {}),
        ...(query.effectiveStatus ? { effectiveStatus: query.effectiveStatus } : {}),
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

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/academic-terms/${id}`);
  },
};
