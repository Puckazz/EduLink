import type { Student } from "./student";
import type { Subject } from "./subject";

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

export interface CreateScoreDto {
  semester: string;
  score_value?: number;
  student_id: number;
  subject_id: number;
}

export type UpdateScoreDto = Partial<CreateScoreDto>;
