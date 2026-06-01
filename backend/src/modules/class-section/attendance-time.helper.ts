import { ClassStatus } from '@prisma/client';

export const VIETNAM_UTC_OFFSET_MINUTES = 7 * 60;
export const ATTENDANCE_OPEN_EARLY_MINUTES = 15;
export const ATTENDANCE_CLOSE_LATE_MINUTES = 30;

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const VIETNAM_OFFSET_MS = VIETNAM_UTC_OFFSET_MINUTES * MINUTE_MS;

export type AttendanceAccessReason =
  | 'OPEN'
  | 'ADMIN_OVERRIDE'
  | 'BEFORE_TERM'
  | 'AFTER_TERM'
  | 'BEFORE_WINDOW'
  | 'AFTER_WINDOW';

export interface AttendanceAccess {
  canEditRecords: boolean;
  reason: AttendanceAccessReason;
  windowStart: string;
  windowEnd: string;
  serverNow: string;
}

export interface TermDateRange {
  start_date: Date;
  end_date: Date;
}

export interface SectionSchedule {
  start_time: string;
  end_time: string;
  term: TermDateRange;
}

export interface SessionDateOnly {
  session_date: Date;
}

function getVietnamDateParts(date: Date) {
  const vietnamDate = new Date(date.getTime() + VIETNAM_OFFSET_MS);
  return {
    year: vietnamDate.getUTCFullYear(),
    month: vietnamDate.getUTCMonth(),
    day: vietnamDate.getUTCDate(),
  };
}

export function toVietnamDbDateOnly(date: Date) {
  const parts = getVietnamDateParts(date);
  return new Date(Date.UTC(parts.year, parts.month, parts.day));
}

function toVietnamLocalInstant(dateOnly: Date, time: string) {
  const parts = getVietnamDateParts(dateOnly);
  const [hourRaw, minuteRaw = '0'] = time.trim().split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error(`Invalid class time: ${time}`);
  }

  return new Date(
    Date.UTC(parts.year, parts.month, parts.day, hour, minute) -
      VIETNAM_OFFSET_MS,
  );
}

function getVietnamDateStart(dateOnly: Date) {
  return toVietnamLocalInstant(dateOnly, '00:00');
}

function getVietnamDateEnd(dateOnly: Date) {
  return new Date(getVietnamDateStart(dateOnly).getTime() + DAY_MS - 1);
}

export function getEffectiveClassStatus(
  term: TermDateRange,
  now = new Date(),
): ClassStatus {
  const termStart = getVietnamDateStart(term.start_date);
  const termEnd = getVietnamDateEnd(term.end_date);

  if (now < termStart) return ClassStatus.UPCOMING;
  if (now > termEnd) return ClassStatus.FINISHED;
  return ClassStatus.ONGOING;
}

export function getEffectiveStatusWhere(status: ClassStatus, now = new Date()) {
  const today = toVietnamDbDateOnly(now);

  if (status === ClassStatus.UPCOMING) {
    return { term: { start_date: { gt: today } } };
  }

  if (status === ClassStatus.FINISHED) {
    return { term: { end_date: { lt: today } } };
  }

  return {
    term: {
      start_date: { lte: today },
      end_date: { gte: today },
    },
  };
}

export function withEffectiveClassStatus<
  T extends { term?: TermDateRange | null; status: ClassStatus },
>(section: T, now = new Date()): T {
  if (!section.term?.start_date || !section.term?.end_date) return section;

  return {
    ...section,
    status: getEffectiveClassStatus(section.term, now),
  };
}

export function getAttendanceAccess(
  section: SectionSchedule,
  session: SessionDateOnly,
  options: { isAdmin?: boolean; now?: Date } = {},
): AttendanceAccess {
  const now = options.now ?? new Date();
  const windowStart = new Date(
    toVietnamLocalInstant(session.session_date, section.start_time).getTime() -
      ATTENDANCE_OPEN_EARLY_MINUTES * MINUTE_MS,
  );
  const windowEnd = new Date(
    toVietnamLocalInstant(session.session_date, section.end_time).getTime() +
      ATTENDANCE_CLOSE_LATE_MINUTES * MINUTE_MS,
  );

  let reason: AttendanceAccessReason = 'OPEN';
  const effectiveStatus = getEffectiveClassStatus(section.term, now);
  if (effectiveStatus === ClassStatus.UPCOMING) reason = 'BEFORE_TERM';
  else if (effectiveStatus === ClassStatus.FINISHED) reason = 'AFTER_TERM';
  else if (now < windowStart) reason = 'BEFORE_WINDOW';
  else if (now > windowEnd) reason = 'AFTER_WINDOW';

  const canEditRecords = reason === 'OPEN' || options.isAdmin === true;

  return {
    canEditRecords,
    reason:
      reason !== 'OPEN' && options.isAdmin === true ? 'ADMIN_OVERRIDE' : reason,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    serverNow: now.toISOString(),
  };
}
