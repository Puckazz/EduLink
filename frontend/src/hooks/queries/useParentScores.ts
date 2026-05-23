'use client';

import { useQuery } from '@tanstack/react-query';
import { useStudentStore } from '@/stores/useStudentStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ScoreService } from '@/services/score.service';
import type { ParentProfile } from '@/types/auth';
import type { Score } from '@/types/score';

export interface UseParentScoresOptions {
  termId?: number;
  academicYearId?: number;
}

function computeGPA(scores: Score[]): number | null {
  const published = scores.filter((s) => s.publish_status === 'PUBLISHED' && s.avg !== null);
  if (published.length === 0) return null;
  const total = published.reduce((sum, s) => sum + (s.avg ?? 0), 0);
  return Math.round((total / published.length) * 100) / 100;
}

function computeCreditsEarned(scores: Score[]): number {
  return scores
    .filter((s) => s.publish_status === 'PUBLISHED' && s.avg !== null && s.avg >= 4)
    .reduce((sum, s) => sum + (s.subject?.credit ?? 3), 0);
}

function getGPAScale(avg: number): number {
  if (avg >= 9.0) return 4.0;
  if (avg >= 8.5) return 4.0;
  if (avg >= 8.0) return 3.5;
  if (avg >= 7.0) return 3.0;
  if (avg >= 5.5) return 2.0;
  if (avg >= 4.0) return 1.0;
  return 0;
}

function computeGPA4(scores: Score[]): number | null {
  const published = scores.filter((s) => s.publish_status === 'PUBLISHED' && s.avg !== null);
  if (published.length === 0) return null;
  
  let totalPoints = 0;
  let totalCredits = 0;
  for (const s of published) {
    const credits = s.subject?.credit ?? 3;
    const point4 = getGPAScale(s.avg!);
    totalPoints += point4 * credits;
    totalCredits += credits;
  }
  
  if (totalCredits === 0) return null;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

export function useParentScores({
  termId,
  academicYearId,
}: UseParentScoresOptions = {}) {
  const profileQuery = useCurrentUser();
  const profile = profileQuery.data as ParentProfile | undefined;
  const students = profile?.students ?? [];

  const { selectedStudentId } = useStudentStore();
  const activeStudentId =
    selectedStudentId !== null && students.some((s) => s.student_id === selectedStudentId)
      ? selectedStudentId
      : students[0]?.student_id ?? 0;

  const activeStudent = students.find((s) => s.student_id === activeStudentId) ?? students[0] ?? null;

  const enabled = !!activeStudentId;

  const scoresQuery = useQuery({
    queryKey: [
      'parent',
      'scores',
      activeStudentId,
      academicYearId ?? 'all-years',
      termId ?? 'all-terms',
    ],
    queryFn: () =>
      ScoreService.getScoresByStudentForParent(activeStudentId, {
        term_id: termId,
        academic_year_id: termId ? undefined : academicYearId,
        limit: 100,
        sort_by: 'created_at',
        sort_order: 'asc',
      }),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const allScoresQuery = useQuery({
    queryKey: ['parent', 'scores', 'all', activeStudentId],
    queryFn: () =>
      ScoreService.getScoresByStudentForParent(activeStudentId, {
        limit: 100,
      }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const scores = scoresQuery.data?.data ?? [];
  const allScores = allScoresQuery.data?.data ?? [];

  const semesterGPA = computeGPA(scores);
  const semesterGPA4 = computeGPA4(scores);
  const cumulativeGPA = computeGPA(allScores);
  const cumulativeGPA4 = computeGPA4(allScores);
  const creditsEarned = computeCreditsEarned(allScores);
  const creditsRegistered = allScores.reduce((sum, s) => sum + (s.subject?.credit ?? 3), 0);

  return {
    profile,
    students,
    activeStudent,
    activeStudentId,
    scores,
    semesterGPA,
    semesterGPA4,
    cumulativeGPA,
    cumulativeGPA4,
    creditsEarned,
    creditsRegistered,
    isLoading: scoresQuery.isPending || profileQuery.isPending,
    isError: scoresQuery.isError || profileQuery.isError,
    refetch: scoresQuery.refetch,
  };
}
