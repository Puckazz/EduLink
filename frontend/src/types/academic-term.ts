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
