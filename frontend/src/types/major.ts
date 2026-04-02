export interface Major {
  major_id: number;
  major_code: string;
  major_name: string;
  created_at: string;
  _count?: {
    students: number;
  };
}
