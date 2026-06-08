import type { Attendance } from '@/types/attendance';
import type { Score } from '@/types/score';

export function calculateAverageScore(scores: Score[]): number | null {
  const values = scores
    .map((score) => score.avg)
    .filter((value): value is number => typeof value === 'number');

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

export function calculateWeightedAverageScore(scores: Score[]): number | null {
  const scoredItems = scores
    .map((score) => ({
      avg: score.avg,
      credit: score.subject?.credit ?? 0,
    }))
    .filter(
      (score): score is { avg: number; credit: number } =>
        typeof score.avg === 'number' && score.credit > 0,
    );

  if (scoredItems.length === 0) {
    return calculateAverageScore(scores);
  }

  const totalCredits = scoredItems.reduce(
    (sum, score) => sum + score.credit,
    0,
  );
  const totalWeightedScore = scoredItems.reduce(
    (sum, score) => sum + score.avg * score.credit,
    0,
  );

  return totalWeightedScore / totalCredits;
}

export function calculateTotalCredits(scores: Score[]): number {
  return scores.reduce((sum, score) => sum + (score.subject?.credit ?? 0), 0);
}

export function summarizeAttendance(records: Attendance[]) {
  const totals = records.reduce(
    (accumulator, record) => {
      accumulator.totalSessions += record.total_sessions;
      accumulator.absentSessions += record.absent_sessions;
      return accumulator;
    },
    {
      totalSessions: 0,
      absentSessions: 0,
    },
  );

  const presentSessions = Math.max(
    0,
    totals.totalSessions - totals.absentSessions,
  );

  const attendanceRate =
    totals.totalSessions > 0
      ? Math.round((presentSessions / totals.totalSessions) * 100)
      : null;

  return {
    totalSessions: totals.totalSessions,
    absentSessions: totals.absentSessions,
    presentSessions,
    attendanceRate,
  };
}
