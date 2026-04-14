export interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credit: number | null;
  _count?: {
    scores: number;
  };
}

export interface SubjectListResponse {
  data: Subject[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_prev: boolean;
    has_next: boolean;
  };
}
