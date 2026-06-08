const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  value: string | null | undefined,
  fallback = '-',
): string {
  const date = parseDate(value);
  return date ? DATE_FORMATTER.format(date) : fallback;
}

export function formatDateTime(
  value: string | null | undefined,
  fallback = '-',
): string {
  const date = parseDate(value);
  return date ? DATE_TIME_FORMATTER.format(date) : fallback;
}

export function formatDateParts(
  value: string | null | undefined,
  fallback = '-',
): { date: string; time: string } {
  const date = parseDate(value);

  if (!date) {
    return { date: fallback, time: fallback };
  }

  return {
    date: DATE_FORMATTER.format(date),
    time: TIME_FORMATTER.format(date),
  };
}

export function formatDateForApi(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateInput(
  value: string | Date | null | undefined,
  fallback = '',
): string {
  if (!value) return fallback;
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString().slice(0, 10);
}
