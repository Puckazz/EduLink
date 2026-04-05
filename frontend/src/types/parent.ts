export interface Parent {
  parent_id: number;
  username: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ParentDetail extends Parent {
  students?: ParentStudent[];
}

export interface ParentStudent {
  student_id: number;
  student_code: string;
  full_name: string;
  status: string;
  class: string | null;
}

export interface ParentListResponse {
  data: Parent[];
}

export interface CreateParentDto {
  full_name: string;
  phone: string;
  email?: string;
  username?: string;
  password?: string;
}

export type UpdateParentDto = Partial<CreateParentDto>;
