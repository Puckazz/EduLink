/**
 * Classify a numeric score into a grade letter (A, B, C, D, F).
 */
export function classifyScore(score: number): string {
  if (score >= 8.5) return 'A';
  if (score >= 7.0) return 'B';
  if (score >= 5.5) return 'C';
  if (score >= 4.0) return 'D';
  return 'F';
}

/**
 * Format a numeric score to a fixed 1 decimal place string.
 * @example formatScore(8.567) // "8.6"
 */
export function formatScore(score: number): string {
  return score.toFixed(1);
}

/**
 * Calculate the average of an array of numeric scores.
 */
export function calcAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return sum / scores.length;
}
