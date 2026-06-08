export function classifyScore(score: number): string {
  if (score >= 9) return 'A+';
  if (score >= 8.5) return 'A';
  if (score >= 8) return 'B+';
  if (score >= 7) return 'B';
  if (score >= 6.5) return 'C+';
  if (score >= 5.5) return 'C';
  if (score >= 5) return 'D+';
  if (score >= 4) return 'D';
  return 'F';
}

export function formatScore(
  score: number | null | undefined,
  fallback = '-',
): string {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return fallback;
  }

  return score.toFixed(1);
}

export function getScoreBand(
  score: number | null | undefined,
  fallback = 'Chưa có',
): string {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return fallback;
  }

  return classifyScore(score);
}

export function calcAverage(scores: number[]): number | null {
  if (scores.length === 0) return null;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return sum / scores.length;
}
