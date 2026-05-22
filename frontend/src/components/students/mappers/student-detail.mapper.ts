import type { Attendance } from '@/types/attendance';
import type { Score } from '@/types/score';

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('vi-VN').format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatScore(scoreValue: number | null): string {
  if (scoreValue === null || Number.isNaN(scoreValue)) {
    return '-';
  }

  return scoreValue.toFixed(1);
}

export function getScoreBand(scoreValue: number | null): string {
  if (scoreValue === null || Number.isNaN(scoreValue)) {
    return 'Chưa có';
  }

  if (scoreValue >= 9) return 'A+';
  if (scoreValue >= 8.5) return 'A';
  if (scoreValue >= 8) return 'B+';
  if (scoreValue >= 7) return 'B';
  if (scoreValue >= 6.5) return 'C+';
  if (scoreValue >= 5.5) return 'C';
  if (scoreValue >= 5) return 'D+';
  if (scoreValue >= 4) return 'D';
  return 'F';
}

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
