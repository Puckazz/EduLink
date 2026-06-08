export type AcademicTermCode = 'HK1' | 'HK2' | 'HKH';
export type AcademicPeriodStatus = 'UPCOMING' | 'ONGOING' | 'FINISHED';

export interface AcademicYear {
  academic_year_id: number;
  name: string;
  start_date: string;
  end_date: string;
  effectiveStatus: AcademicPeriodStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAcademicYearDto {
  name: string;
  start_date: string;
  end_date: string;
}

export type UpdateAcademicYearDto = Partial<CreateAcademicYearDto>;

export interface AcademicTerm {
  term_id: number;
  code: AcademicTermCode;
  name: string;
  start_date: string;
  end_date: string;
  effectiveStatus: AcademicPeriodStatus;
  academic_year_id: number;
  academic_year: AcademicYear;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAcademicTermDto {
  code: AcademicTerm['code'];
  academic_year_id: number;
  name?: string;
  start_date: string;
  end_date: string;
}

export type UpdateAcademicTermDto = Partial<CreateAcademicTermDto>;

export interface AcademicTermQuery {
  academicYearId?: number;
  effectiveStatus?: AcademicPeriodStatus;
}
