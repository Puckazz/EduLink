'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScoreService } from '@/services/score.service';
import { SubjectService } from '@/services/subject.service';
import { MajorService } from '@/services/major.service';
import type {
  ScorebookRow,
  ScorebookUiRow,
  ScoreLogEntry,
  ScorePublishStatus,
  BulkUpdateRow,
  ScorebookQuery,
} from '@/types/score';
import type { Subject } from '@/types/subject';
import type { ImportedScoreRow } from '@/components/scores/utils/score-excel';

interface UseScoreManagementParams {
  selectedMajor: string;
  selectedClass: string;
  searchKeyword: string;
  selectedSubjectId: string;
  selectedAcademicYearId: string;
  selectedTermId: string;
  selectedStatus: 'all' | 'PUBLISHED' | 'DRAFT';
}

function toUiRow(
  backendRow: ScorebookRow,
  subjectName: string,
): ScorebookUiRow {
  const score = backendRow.score;
  const uniqueId = `${backendRow.student_id}-${score?.subject_id ?? 'none'}-${score?.term_id ?? 'none'}`;
  return {
    id: uniqueId,
    score_id: score?.score_id ?? null,
    student_id: backendRow.student_id,
    student_code: backendRow.student_code,
    student_name: backendRow.full_name,
    class_name: backendRow.class_name,
    major_name: backendRow.major_name,
    subject_name: score?.subject?.subject_name ?? subjectName,
    credit: score?.subject?.credit ?? null,
    assignment: score?.assignment ?? null,
    midterm: score?.midterm ?? null,
    final: score?.final ?? null,
    avg: score?.avg ?? null,
    note: score?.note ?? '',
    publish_status: (score?.publish_status as ScorePublishStatus) ?? 'DRAFT',
    subject_id: score?.subject_id ?? null,
    term_id: score?.term_id,
    term: score?.term,
    updated_at: score?.updated_at,
  };
}

export function useScoreManagement({
  selectedMajor,
  selectedClass,
  searchKeyword,
  selectedSubjectId,
  selectedAcademicYearId,
  selectedTermId,
  selectedStatus,
}: UseScoreManagementParams) {
  const [backendRows, setBackendRows] = useState<ScorebookRow[]>([]);
  const [logs, setLogs] = useState<ScoreLogEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [majorOptions, setMajorOptions] = useState<string[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const [majorsRes, subjectsRes] = await Promise.all([
          MajorService.getAll(),
          SubjectService.getAll(),
        ]);
        setMajorOptions(majorsRes.map((m) => m.major_name));
        setSubjects(subjectsRes);
      } catch {
      }
    }
    void fetchMetadata();
  }, []);

  const fetchScorebook = useCallback(async () => {
    if (!selectedMajor) {
      setBackendRows([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const query: ScorebookQuery = {
        major: selectedMajor || undefined,
        class: selectedClass !== 'all' ? selectedClass : undefined,
        search: searchKeyword.trim() || undefined,
        subject_id:
          selectedSubjectId !== 'all' ? Number(selectedSubjectId) : undefined,
        term_id: selectedTermId !== 'all' ? Number(selectedTermId) : undefined,
        academic_year_id:
          selectedTermId === 'all' && selectedAcademicYearId !== 'all'
            ? Number(selectedAcademicYearId)
            : undefined,
      };

      const data = await ScoreService.getScorebook(query);
      setBackendRows(data);
    } catch {
      setErrorMessage('Không thể tải bảng điểm. Vui lòng thử lại.');
      setBackendRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedMajor,
    selectedClass,
    searchKeyword,
    selectedSubjectId,
    selectedAcademicYearId,
    selectedTermId,
  ]);

  useEffect(() => {
    void fetchScorebook();
  }, [fetchScorebook]);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await ScoreService.getLogs(50);
      setLogs(data);
    } catch {
    }
  }, []);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const [classOptions, setClassOptions] = useState<string[]>([]);

  useEffect(() => {
    if (selectedClass === 'all') {
      const classes = new Set(
        backendRows.map((r) => r.class_name).filter(Boolean),
      );
      setClassOptions(
        Array.from(classes).sort((a, b) => a.localeCompare(b, 'vi')),
      );
    }
  }, [backendRows, selectedClass]);

  const selectedSubjectName = useMemo(() => {
    if (selectedSubjectId === 'all') return 'Tất cả môn';
    const subject = subjects.find(
      (s) => String(s.subject_id) === selectedSubjectId,
    );
    return subject?.subject_name ?? '';
  }, [selectedSubjectId, subjects]);

  const rows: ScorebookUiRow[] = useMemo(() => {
    let result = backendRows.map((r) => toUiRow(r, selectedSubjectName));
    if (selectedStatus !== 'all') {
      result = result.filter((r) => r.publish_status === selectedStatus);
    }
    return result;
  }, [backendRows, selectedSubjectName, selectedStatus]);

  const selectedRow = useMemo(
    () => rows.find((r) => r.id === selectedRowId) ?? null,
    [rows, selectedRowId],
  );

  const publishedCount = rows.filter(
    (r) => r.publish_status === 'PUBLISHED',
  ).length;
  const isFullyPublished = rows.length > 0 && publishedCount === rows.length;

  const updateStudentDraft = useCallback(
    async (
      rowId: string,
      payload: {
        assignment: number | null;
        midterm: number | null;
        final: number | null;
        note: string;
      },
      actor: string,
    ) => {
      const row = rows.find((r) => r.id === rowId);
      if (!row) return;

      if (row.score_id) {
        await ScoreService.update(row.score_id, payload);
      } else {
        if (
          selectedSubjectId === 'all' ||
          !selectedTermId ||
          selectedTermId === 'all'
        )
          return;
        await ScoreService.createForStudent(row.student_id, {
          subject_id: Number(selectedSubjectId),
          term_id: Number(selectedTermId),
          assignment: payload.assignment ?? undefined,
          midterm: payload.midterm ?? undefined,
          final: payload.final ?? undefined,
          note: payload.note,
        });
      }

      const validSubjectId =
        selectedSubjectId === 'all'
          ? row.subject_id
          : Number(selectedSubjectId);

      if (!validSubjectId) {
        await Promise.all([fetchScorebook(), fetchLogs()]);
        return;
      }

      const validTermId =
        selectedTermId === 'all' ? row.term_id : Number(selectedTermId);
      if (!validTermId) {
        await Promise.all([fetchScorebook(), fetchLogs()]);
        return;
      }

      await ScoreService.bulkUpdate({
        subject_id: validSubjectId,
        term_id: validTermId,
        rows: [
          {
            student_id: row.student_id,
            assignment: payload.assignment ?? undefined,
            midterm: payload.midterm ?? undefined,
            final: payload.final ?? undefined,
            note: payload.note,
          },
        ],
        actor,
        log_action: 'MANUAL_EDIT',
        log_description: `Chỉnh sửa điểm sinh viên ${row.student_code} (${row.student_name}) môn ${row.subject_name}.`,
      });

      await Promise.all([fetchScorebook(), fetchLogs()]);
    },
    [
      rows,
      selectedSubjectId,
      selectedTermId,
      fetchScorebook,
      fetchLogs,
    ],
  );

  const applyBulkImport = useCallback(
    async (importRows: ImportedScoreRow[], actor: string) => {
      if (
        selectedSubjectId === 'all' ||
        !selectedTermId ||
        selectedTermId === 'all'
      ) {
        return { updatedCount: 0, missingCodes: [] };
      }

      const byCode = new Map(
        rows.map((r) => [r.student_code.toLowerCase(), r]),
      );
      const missingCodes: string[] = [];
      const updateRows: BulkUpdateRow[] = [];

      for (const importRow of importRows) {
        const row = byCode.get(importRow.student_code.toLowerCase());
        if (!row) {
          missingCodes.push(importRow.student_code);
          continue;
        }
        updateRows.push({
          student_id: row.student_id,
          assignment: importRow.assignment ?? undefined,
          midterm: importRow.midterm ?? undefined,
          final: importRow.final ?? undefined,
          note: importRow.note ?? undefined,
        });
      }

      if (updateRows.length > 0) {
        await ScoreService.bulkUpdate({
          subject_id: Number(selectedSubjectId),
          term_id: Number(selectedTermId),
          rows: updateRows,
          actor,
          log_action: 'BULK_IMPORT',
          log_description: `Import Excel điểm môn ${selectedSubjectName}, cập nhật ${updateRows.length} sinh viên.`,
        });
        await Promise.all([fetchScorebook(), fetchLogs()]);
      }

      return { updatedCount: updateRows.length, missingCodes };
    },
    [
      rows,
      selectedSubjectId,
      selectedTermId,
      selectedSubjectName,
      fetchScorebook,
      fetchLogs,
    ],
  );

  const publishSelectedScores = useCallback(
    async (scoreIds: number[], status: ScorePublishStatus, actor: string) => {
      if (scoreIds.length === 0) return;
      await ScoreService.bulkPublish({
        score_ids: scoreIds,
        status,
        actor,
      });
      await Promise.all([fetchScorebook(), fetchLogs()]);
    },
    [fetchScorebook, fetchLogs],
  );

  const publishFilteredScores = useCallback(
    async (status: ScorePublishStatus, actor: string) => {
      await ScoreService.bulkPublish({
        major: selectedMajor || undefined,
        class: selectedClass !== 'all' ? selectedClass : undefined,
        subject_id:
          selectedSubjectId !== 'all' ? Number(selectedSubjectId) : undefined,
        term_id: selectedTermId !== 'all' ? Number(selectedTermId) : undefined,
        academic_year_id:
          selectedTermId === 'all' && selectedAcademicYearId !== 'all'
            ? Number(selectedAcademicYearId)
            : undefined,
        status,
        actor,
      });
      await Promise.all([fetchScorebook(), fetchLogs()]);
    },
    [
      selectedMajor,
      selectedClass,
      selectedSubjectId,
      selectedAcademicYearId,
      selectedTermId,
      fetchScorebook,
      fetchLogs,
    ],
  );

  const refetchAll = useCallback(async () => {
    await Promise.all([fetchScorebook(), fetchLogs()]);
  }, [fetchScorebook, fetchLogs]);

  return {
    rows,
    selectedRow,
    setSelectedRowId,
    logs,
    majorOptions,
    classOptions,
    subjects,
    isLoading,
    errorMessage,
    publishedCount,
    isFullyPublished,
    updateStudentDraft,
    applyBulkImport,
    publishSelectedScores,
    publishFilteredScores,
    refetchAll,
  };
}
