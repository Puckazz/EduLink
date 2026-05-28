export interface Teacher {
  teacher_id: number;
  username: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  class_section_count: number;
}

export type TeacherSortOption =
  | 'created_desc'
  | 'created_asc'
  | 'name_asc'
  | 'name_desc';

export interface TeacherListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: TeacherSortOption;
}

export interface TeacherListResponse {
  data: Teacher[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface CreateTeacherDto {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  phone?: string;
}

export type UpdateTeacherDto = Partial<CreateTeacherDto>;
