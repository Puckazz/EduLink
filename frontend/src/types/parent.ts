export interface Parent {
  parent_id: number;
  username: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  relationship: ParentRelationshipValue;
  is_active: boolean;
  created_at: string;
}

export type ParentRelationshipValue = 'CHA' | 'ME' | 'NGUOI_GIAM_HO';

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

export type ParentStatusFilter = '' | 'active' | 'inactive';

export interface ParentListQuery {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateParentDto {
  full_name: string;
  phone: string;
  email?: string;
  username?: string;
  password?: string;
  relationship?: ParentRelationshipValue;
}

export type UpdateParentDto = Partial<CreateParentDto>;
