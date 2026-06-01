import { AcademicPeriodStatus } from '@prisma/client';

const MINUTE_MS = 60 * 1000;
const VIETNAM_UTC_OFFSET_MINUTES = 7 * 60;
const VIETNAM_OFFSET_MS = VIETNAM_UTC_OFFSET_MINUTES * MINUTE_MS;

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
): AcademicPeriodStatus {
  const today = toVietnamDbDateOnly(now);

  if (period.start_date > today) return AcademicPeriodStatus.UPCOMING;
  if (period.end_date < today) return AcademicPeriodStatus.FINISHED;
  return AcademicPeriodStatus.ONGOING;
}

export function getEffectiveAcademicStatusWhere(
  status: AcademicPeriodStatus,
  now = new Date(),
) {
  const today = toVietnamDbDateOnly(now);

  if (status === AcademicPeriodStatus.UPCOMING) {
    return { start_date: { gt: today } };
  }

  if (status === AcademicPeriodStatus.FINISHED) {
    return { end_date: { lt: today } };
  }

  return {
    start_date: { lte: today },
    end_date: { gte: today },
  };
}

export function withEffectiveAcademicStatus<
  T extends AcademicPeriodDateRange & { status: AcademicPeriodStatus },
>(period: T, now = new Date()): T {
  return {
    ...period,
    status: getEffectiveAcademicStatus(period, now),
  };
}
