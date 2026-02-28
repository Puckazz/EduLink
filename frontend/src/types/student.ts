export interface Student {
  student_id: number;
  student_code: string;
  full_name: string;
  date_of_birth: string | null;
  class: string | null;
  created_at: string;
  parent_id: number | null;
}

export interface CreateStudentDto {
  student_code: string;
  full_name: string;
  date_of_birth?: string;
  class?: string;
  parent_id?: number;
}

export type UpdateStudentDto = Partial<CreateStudentDto>;
