export type StudentStatusValue = 'DANG_HOC' | 'BAO_LUU' | 'DINH_CHI';
export type StudentStatusLabel = 'Đang học' | 'Bảo lưu' | 'Đình chỉ';
export type StudentSortOption = 'created_desc' | 'created_asc' | 'name_asc' | 'name_desc' | 'id_asc' | 'id_desc';

export interface StudentParent {
  parent_id: number;
  full_name: string;
  phone: string;
  email: string | null;
}

export interface StudentMajor {
  major_id: number;
  major_code: string;
  major_name: string;
}

export interface Student {
  student_id: number;
  student_code: string;
  full_name: string;
  email: string | null;
  status: StudentStatusLabel;
  date_of_birth: string | null;
  class: string | null;
  study_year: number | null;
  cohort: string | null;
  created_at: string;
  parent_id: number | null;
  major_id: number | null;
  parent: StudentParent | null;
  major: StudentMajor | null;
}

export interface StudentListQuery {
  search?: string;
  status?: StudentStatusValue;
  class?: string;
  parent_id?: number;
  major_id?: number;
  page?: number;
  limit?: number;
  sort_by?: 'student_id' | 'full_name' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
}

export interface StudentListResponse {
  data: Student[];
  pagination: PaginationMeta;
}

export interface CreateStudentDto {
  student_code: string;
  full_name: string;
  email?: string;
  status?: StudentStatusValue;
  date_of_birth?: string;
  class?: string;
  study_year?: number;
  cohort?: string;
  parent_id?: number;
  major_id?: number;
}

export type UpdateStudentDto = Partial<CreateStudentDto>;

// ─── Student-Parent linkage ────────────────────────────────────────────────

export interface AssignParentDto {
  parent_id: number;
}

export interface StudentParentDetail {
  parent_id: number;
  full_name: string;
  phone: string;
  email: string | null;
  relationship: 'CHA' | 'ME' | 'NGUOI_GIAM_HO';
  is_active: boolean;
  created_at: string;
}

export interface StudentParentsResponse {
  data: StudentParentDetail[];
}
