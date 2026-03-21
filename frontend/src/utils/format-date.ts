/**
 * Format a date string to Vietnamese locale format.
 * @example formatDate("2024-01-15") // "15/01/2024"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a datetime string to Vietnamese locale format including time.
 * @example formatDateTime("2024-01-15T10:30:00") // "15/01/2024 10:30"
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
