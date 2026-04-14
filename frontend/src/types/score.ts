import type { Student } from './student';
import type { Subject } from './subject';

export interface Score {
  score_id: number;
  semester: string;
  score_value: number | null;
  created_at: string;
  student_id: number;
  subject_id: number;
  student?: Student;
  subject?: Subject;
}

export interface ScoreListQuery {
  subject_id?: number;
  semester?: string;
  year?: number;
  page?: number;
  limit?: number;
  sort_by?: 'score_id' | 'semester' | 'year' | 'score_value' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface ScoreListResponse {
  data: Score[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_prev: boolean;
    has_next: boolean;
  };
}

export interface CreateScoreDto {
  semester: string;
  year: number;
  score_value?: number;
  student_id: number;
  subject_id: number;
}

export type UpdateScoreDto = Partial<CreateScoreDto>;

export type ScorePublishStatus = 'DRAFT' | 'PUBLISHED';

export interface ScorebookRow {
  student_id: number;
  student_code: string;
  student_name: string;
  class_name: string;
  assignment: number | null;
  midterm: number | null;
  final: number | null;
  avg: number | null;
  note: string;
  publish_status: ScorePublishStatus;
  updated_at?: string;
}

export interface ScoreLogEntry {
  id: string;
  actor: string;
  action: 'MANUAL_EDIT' | 'BULK_IMPORT' | 'PUBLISH' | 'UNPUBLISH';
  student_code?: string;
  student_name?: string;
  description: string;
  created_at: string;
}

export interface ScorebookExportRow {
  student_code: string;
  student_name: string;
  class_name: string;
  assignment: number | null;
  midterm: number | null;
  final: number | null;
  avg: number | null;
  publish_status: ScorePublishStatus;
  note: string;
}
