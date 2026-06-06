const MINUTE_MS = 60 * 1000;
const VIETNAM_UTC_OFFSET_MINUTES = 7 * 60;
const VIETNAM_OFFSET_MS = VIETNAM_UTC_OFFSET_MINUTES * MINUTE_MS;

export const EFFECTIVE_STATUS_VALUES = [
  'UPCOMING',
  'ONGOING',
  'FINISHED',
] as const;

export type EffectiveStatus = (typeof EFFECTIVE_STATUS_VALUES)[number];

export interface AcademicPeriodDateRange {
  start_date: Date;
  end_date: Date;
}

function getVietnamDateParts(date: Date) {
  const vietnamDate = new Date(date.getTime() + VIETNAM_OFFSET_MS);
  return {
    year: vietnamDate.getUTCFullYear(),
    month: vietnamDate.getUTCMonth(),
    day: vietnamDate.getUTCDate(),
  };
}

function toVietnamDbDateOnly(date: Date) {
  const parts = getVietnamDateParts(date);
  return new Date(Date.UTC(parts.year, parts.month, parts.day));
}

export function getEffectiveAcademicStatus(
  period: AcademicPeriodDateRange,
  now = new Date(),
): EffectiveStatus {
  const today = toVietnamDbDateOnly(now);

  if (period.start_date > today) return 'UPCOMING';
  if (period.end_date < today) return 'FINISHED';
  return 'ONGOING';
}

export function getEffectiveAcademicStatusWhere(
  effectiveStatus: EffectiveStatus,
  now = new Date(),
) {
  const today = toVietnamDbDateOnly(now);

  if (effectiveStatus === 'UPCOMING') {
    return { start_date: { gt: today } };
  }

  if (effectiveStatus === 'FINISHED') {
    return { end_date: { lt: today } };
  }

  return {
    start_date: { lte: today },
    end_date: { gte: today },
  };
}

export function withEffectiveAcademicStatus<T extends AcademicPeriodDateRange>(
  period: T,
  now = new Date(),
): T & { effectiveStatus: EffectiveStatus } {
  return {
    ...period,
    effectiveStatus: getEffectiveAcademicStatus(period, now),
  };
}
