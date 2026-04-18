import { useEffect, useMemo, useState } from 'react';
import { calcAverage } from '@/utils/format-score';
import type {
  ScoreLogEntry,
  ScorePublishStatus,
  ScorebookRow,
} from '@/types/score';
import type { Subject } from '@/types/subject';
import type { ImportedScoreRow } from '@/components/scores/utils/score-excel';
import {
  MOCK_SCORE_SEED_BY_STUDENT_ID,
  MOCK_STUDENTS,
  MOCK_SUBJECTS,
  type ScorebookStudentMock,
} from '@/components/scores/mocks/score-management.mock';

interface ScoreDraft {
  assignment: number | null;
  midterm: number | null;
  final: number | null;
  note: string;
  publish_status: ScorePublishStatus;
  updated_at?: string;
}

interface UpdateScoreDraftPayload {
  assignment: number | null;
  midterm: number | null;
  final: number | null;
  note: string;
}

interface UseScoreManagementParams {
  selectedMajor: string;
  selectedClass: string;
  searchKeyword: string;
  selectedSubjectId: string;
  selectedSemester: string;
}

const SCORE_WEIGHTS = {
  assignment: 0.2,
  midterm: 0.3,
  final: 0.5,
};

const DEFAULT_DRAFT: ScoreDraft = {
  assignment: null,
  midterm: null,
  final: null,
  note: '',
  publish_status: 'DRAFT',
};

const MOCK_STUDENTS_SORTED = [...MOCK_STUDENTS].sort((a, b) =>
  a.full_name.localeCompare(b.full_name, 'vi'),
);

function toIsoNow(): string {
  return new Date().toISOString();
}

function createLogEntry(
  input: Omit<ScoreLogEntry, 'id' | 'created_at'>,
): ScoreLogEntry {
  return {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: toIsoNow(),
  };
}

function computeAvg(draft: ScoreDraft): number | null {
  if (
    draft.assignment === null &&
    draft.midterm === null &&
    draft.final === null
  ) {
    return null;
  }

  const weightedScores: number[] = [];
  const weightedValues: number[] = [];

  if (draft.assignment !== null) {
    weightedScores.push(draft.assignment);
    weightedValues.push(SCORE_WEIGHTS.assignment);
  }

  if (draft.midterm !== null) {
    weightedScores.push(draft.midterm);
    weightedValues.push(SCORE_WEIGHTS.midterm);
  }

  if (draft.final !== null) {
    weightedScores.push(draft.final);
    weightedValues.push(SCORE_WEIGHTS.final);
  }

  if (weightedScores.length === 0) {
    return null;
  }

  const weightSum = calcAverage(weightedValues) * weightedValues.length;

  const total = weightedScores.reduce((sum, score, index) => {
    return sum + score * weightedValues[index];
  }, 0);

  return Math.round((total / weightSum) * 100) / 100;
}

function mapStudentToScoreRow(
  student: ScorebookStudentMock,
  draft: ScoreDraft,
  subjectName: string,
): ScorebookRow {
  return {
    student_id: student.student_id,
    student_code: student.student_code,
    student_name: student.full_name,
    class_name: student.class_name,
    subject_name: subjectName,
    assignment: draft.assignment,
    midterm: draft.midterm,
    final: draft.final,
    avg: computeAvg(draft),
    note: draft.note,
    publish_status: draft.publish_status,
    updated_at: draft.updated_at,
  };
}

function getSubjectForStudent(
  studentId: number,
  subjects: Subject[],
): Subject | undefined {
  if (subjects.length === 0) {
    return undefined;
  }

  const index = (studentId - 1) % subjects.length;
  return subjects[index];
}

export function useScoreManagement({
  selectedMajor,
  selectedClass,
  searchKeyword,
  selectedSubjectId,
  selectedSemester,
}: UseScoreManagementParams) {
  const [draftMap, setDraftMap] = useState<Record<number, ScoreDraft>>({});
  const [logs, setLogs] = useState<ScoreLogEntry[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );

  const students = MOCK_STUDENTS_SORTED;
  const subjects = MOCK_SUBJECTS;

  useEffect(() => {
    if (students.length === 0) {
      return;
    }

    setDraftMap((prev) => {
      const next = { ...prev };
      let hasChanges = false;

      for (const student of students) {
        if (!next[student.student_id]) {
          next[student.student_id] =
            MOCK_SCORE_SEED_BY_STUDENT_ID[student.student_id] ?? DEFAULT_DRAFT;
          hasChanges = true;
        }
      }

      return hasChanges ? next : prev;
    });
  }, [students]);

  const classOptions = useMemo(() => {
    const classes = new Set<string>();

    for (const student of students) {
      const className = student.class_name.trim();
      if (className) {
        classes.add(className);
      }
    }

    return Array.from(classes).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [students]);

  const majorOptions = useMemo(() => {
    const majors = new Set<string>();

    for (const student of students) {
      if (student.major_name.trim()) {
        majors.add(student.major_name.trim());
      }
    }

    return Array.from(majors).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesMajor =
        selectedMajor.trim().length > 0 && student.major_name === selectedMajor;

      if (!matchesMajor) {
        return false;
      }

      const matchesClass =
        selectedClass === 'all' || student.class_name === selectedClass;

      if (!matchesClass) {
        return false;
      }

      if (!searchKeyword.trim()) {
        return true;
      }

      const normalizedKeyword = searchKeyword.trim().toLowerCase();
      return (
        student.full_name.toLowerCase().includes(normalizedKeyword) ||
        student.student_code.toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [students, selectedMajor, selectedClass, searchKeyword]);

  const rows = useMemo(() => {
    const selectedSubjectNumericId =
      selectedSubjectId === 'all' ? null : Number(selectedSubjectId);

    const mappedRows: ScorebookRow[] = [];

    for (const student of filteredStudents) {
      const subject = getSubjectForStudent(student.student_id, subjects);

      if (!subject) {
        continue;
      }

      if (
        selectedSubjectNumericId !== null &&
        subject.subject_id !== selectedSubjectNumericId
      ) {
        continue;
      }

      const draft = draftMap[student.student_id] ?? DEFAULT_DRAFT;
      mappedRows.push(
        mapStudentToScoreRow(student, draft, subject.subject_name),
      );
    }

    return mappedRows;
  }, [draftMap, filteredStudents, selectedSubjectId, subjects]);

  void selectedSemester;

  const selectedRow = useMemo(() => {
    if (selectedStudentId === null) {
      return null;
    }

    return rows.find((row) => row.student_id === selectedStudentId) ?? null;
  }, [rows, selectedStudentId]);

  useEffect(() => {
    if (rows.length === 0) {
      setSelectedStudentId(null);
      return;
    }

    if (
      selectedStudentId === null ||
      !rows.some((row) => row.student_id === selectedStudentId)
    ) {
      setSelectedStudentId(rows[0].student_id);
    }
  }, [rows, selectedStudentId]);

  const publishedCount = rows.filter(
    (row) => row.publish_status === 'PUBLISHED',
  ).length;
  const isFullyPublished = rows.length > 0 && publishedCount === rows.length;

  const updateStudentDraft = (
    studentId: number,
    payload: UpdateScoreDraftPayload,
    actor: string,
  ) => {
    setDraftMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...payload,
        updated_at: toIsoNow(),
      },
    }));

    const student = students.find((item) => item.student_id === studentId);

    setLogs((prev) => [
      createLogEntry({
        actor,
        action: 'MANUAL_EDIT',
        student_code: student?.student_code,
        student_name: student?.full_name,
        description: `Cập nhật điểm thành phần cho ${student?.full_name ?? 'học sinh'}`,
      }),
      ...prev,
    ]);
  };

  const applyBulkImport = (importRows: ImportedScoreRow[], actor: string) => {
    const byCode = new Map(
      students.map((student) => [student.student_code.toLowerCase(), student]),
    );
    const missingCodes: string[] = [];
    let updatedCount = 0;

    setDraftMap((prev) => {
      const next = { ...prev };

      for (const importRow of importRows) {
        const student = byCode.get(importRow.student_code.toLowerCase());

        if (!student) {
          missingCodes.push(importRow.student_code);
          continue;
        }

        next[student.student_id] = {
          ...next[student.student_id],
          assignment: importRow.assignment,
          midterm: importRow.midterm,
          final: importRow.final,
          note: importRow.note,
          updated_at: toIsoNow(),
        };
        updatedCount += 1;
      }

      return next;
    });

    if (updatedCount > 0) {
      setLogs((prev) => [
        createLogEntry({
          actor,
          action: 'BULK_IMPORT',
          description: `Import Excel và cập nhật ${updatedCount} học sinh.`,
        }),
        ...prev,
      ]);
    }

    return {
      updatedCount,
      missingCodes,
    };
  };

  const setPublishStatusForFilteredRows = (
    status: ScorePublishStatus,
    actor: string,
  ) => {
    const targetIds = new Set(rows.map((row) => row.student_id));

    setDraftMap((prev) => {
      const next = { ...prev };

      for (const studentId of targetIds) {
        next[studentId] = {
          ...next[studentId],
          publish_status: status,
          updated_at: toIsoNow(),
        };
      }

      return next;
    });

    setLogs((prev) => [
      createLogEntry({
        actor,
        action: status === 'PUBLISHED' ? 'PUBLISH' : 'UNPUBLISH',
        description:
          status === 'PUBLISHED'
            ? `Công bố bảng điểm cho ${targetIds.size} học sinh.`
            : `Hủy công bố bảng điểm cho ${targetIds.size} học sinh.`,
      }),
      ...prev,
    ]);
  };

  return {
    rows,
    selectedRow,
    setSelectedStudentId,
    logs,
    majorOptions,
    classOptions,
    subjects,
    isLoading: false,
    isRefetching: false,
    errorMessage: null,
    publishedCount,
    isFullyPublished,
    updateStudentDraft,
    applyBulkImport,
    setPublishStatusForFilteredRows,
    refetchAll: () => Promise.resolve(),
  };
}
