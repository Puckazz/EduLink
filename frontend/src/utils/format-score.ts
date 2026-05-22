export function classifyScore(score: number): string {
  if (score >= 8.5) return 'A';
  if (score >= 7.0) return 'B';
  if (score >= 5.5) return 'C';
  if (score >= 4.0) return 'D';
  return 'F';
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function calcAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return sum / scores.length;
}
