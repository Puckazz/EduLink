export interface Parent {
  parent_id: number;
  username: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  relationship: ParentRelationshipValue;
  is_active: boolean;
  created_at: string;
  students?: ParentStudent[];
}

export type ParentRelationshipValue = 'CHA' | 'ME' | 'NGUOI_GIAM_HO';

export interface ParentDetail extends Parent {}

export interface ParentStudent {
  student_id: number;
  student_code: string;
  full_name: string;
  status: string;
  class: string | null;
}

export interface ParentListResponse {
  data: Parent[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export type ParentStatusFilter = '' | 'active' | 'inactive';
export type ParentRelationshipFilter = '' | 'CHA' | 'ME' | 'NGUOI_GIAM_HO';
export type ParentSortOption = 'created_desc' | 'created_asc' | 'name_asc' | 'name_desc';

export interface ParentListQuery {
  search?: string;
  status?: ParentStatusFilter;
  relationship?: ParentRelationshipFilter;
  sort?: ParentSortOption;
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
