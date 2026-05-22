import { Student, StudentParent } from '@/types/student';

export interface ParentStudentLinkRow {
  student_id: number;
  student_code: string;
  student_name: string;
  class: string | null;
  parent_id: number;
  parent_name: string;
  phone: string;
  email: string | null;
  relationship: 'CHA' | 'ME' | 'NGUOI_GIAM_HO';
  is_active: boolean;
}

export function mapStudentsToLinkRows(
  students: Student[],
): ParentStudentLinkRow[] {
  return students
    .filter((student) => student.parents && student.parents.length > 0)
    .flatMap((student) => {
      return student.parents!.map(parentData => ({
        student_id: student.student_id,
        student_code: student.student_code,
        student_name: student.full_name,
        class: student.class,
        parent_id: parentData.parent_id,
        parent_name: parentData.full_name || '',
        phone: parentData.phone || '',
        email: parentData.email || null,
        relationship: parentData.relationship || 'NGUOI_GIAM_HO',
        is_active: parentData.is_active ?? false,
      }));
    });
}
