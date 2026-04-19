import type { Subject } from './subject';

export interface Score {
  score_id: number;
  semester: string;
  year: number;
  assignment: number | null;
  midterm: number | null;
  final: number | null;
  avg: number | null;
  note: string | null;
  publish_status: ScorePublishStatus;
  created_at: string;
  updated_at: string;
  student_id: number;
  subject_id: number;
  subject?: Subject;
}

export interface ScoreListQuery {
  subject_id?: number;
  semester?: string;
  year?: number;
  page?: number;
  limit?: number;
  sort_by?: 'score_id' | 'semester' | 'year' | 'created_at';
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
  subject_id: number;
  assignment?: number;
  midterm?: number;
  final?: number;
  note?: string;
}

export interface UpdateScoreDto {
  assignment?: number | null;
  midterm?: number | null;
  final?: number | null;
  note?: string;
}

export type ScorePublishStatus = 'DRAFT' | 'PUBLISHED';

// Scorebook – row displayed in the Admin Scores table
export interface ScorebookRow {
  student_id: number;
  student_code: string;
  full_name: string;
  class_name: string;
  major_name: string;
  score: Score | null;
}

// Local UI-layer type augmenting ScorebookRow with editable draft state
export interface ScorebookUiRow {
  id: string;
  score_id: number | null;
  student_id: number;
  student_code: string;
  student_name: string;
  class_name: string;
  major_name: string;
  subject_name: string;
  credit: number | null;
  assignment: number | null;
  midterm: number | null;
  final: number | null;
  avg: number | null;
  note: string;
  publish_status: ScorePublishStatus;
  subject_id?: number | null;
  semester?: string;
  updated_at?: string;
}

export interface StudentGroup {
  student_id: number;
  student_code: string;
  student_name: string;
  class_name: string;
  rows: ScorebookUiRow[];
}

export interface ScoreLogEntry {
  log_id: number;
  actor: string;
  action: string;
  student_code?: string;
  student_name?: string;
  description: string;
  created_at: string;
}

export interface ScorebookQuery {
  major?: string;
  class?: string;
  search?: string;
  subject_id?: number;
  semester?: string;
  year?: number;
}

export interface BulkUpdateRow {
  student_id: number;
  assignment?: number;
  midterm?: number;
  final?: number;
  note?: string;
}

export interface BulkUpdateScoreDto {
  subject_id: number;
  semester: string;
  year: number;
  rows: BulkUpdateRow[];
  actor?: string;
  log_action?: string;
  log_description?: string;
}

export interface BulkPublishDto {
  score_ids?: number[];
  major?: string;
  class?: string;
  subject_id?: number;
  semester?: string;
  status: ScorePublishStatus;
  actor?: string;
}

export interface ScorebookExportRow {
  student_code: string;
  student_name: string;
  class_name: string;
  subject_name: string;
  credit: number | null;
  assignment: number | null;
  midterm: number | null;
  final: number | null;
  avg: number | null;
  rank: string;
  publish_status: ScorePublishStatus;
  note: string;
}
