import type {
  AcademicPeriodStatus,
  AcademicTerm,
  AcademicTermCode,
} from '@/types/academic-term';

export const ACADEMIC_STATUS_LABEL: Record<AcademicPeriodStatus, string> = {
  UPCOMING: 'Sắp tới',
  ONGOING: 'Đang diễn ra',
  FINISHED: 'Đã kết thúc',
};

export const TERM_CODE_LABEL: Record<AcademicTermCode, string> = {
  HK1: 'Học kỳ I',
  HK2: 'Học kỳ II',
  HKH: 'Học kỳ hè',
};

export function formatAcademicTerm(term: AcademicTerm) {
  return `${TERM_CODE_LABEL[term.code]} - ${term.academic_year.name}`;
}

export function toDateInputValue(value?: string | Date | null) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toLocalDateOnly(value: string | Date) {
  const raw = typeof value === 'string' ? value.slice(0, 10) : value.toISOString().slice(0, 10);
  return new Date(`${raw}T00:00:00`);
}

export function getEffectiveAcademicStatus(
  startDate: string | Date,
  endDate: string | Date,
  now = new Date(),
): AcademicPeriodStatus {
  const today = toLocalDateOnly(now);
  const start = toLocalDateOnly(startDate);
  const end = toLocalDateOnly(endDate);

  if (today < start) return 'UPCOMING';
  if (today > end) return 'FINISHED';
  return 'ONGOING';
}

export function defaultAcademicYearDates(startYear: number) {
  return {
    start_date: `${startYear}-09-01`,
    end_date: `${startYear + 1}-08-31`,
  };
}

export function defaultTermDates(code: AcademicTermCode, startYear: number) {
  if (code === 'HK1') {
    return { start_date: `${startYear}-09-01`, end_date: `${startYear + 1}-01-15` };
  }
  if (code === 'HK2') {
    return { start_date: `${startYear + 1}-02-01`, end_date: `${startYear + 1}-06-15` };
  }
  return { start_date: `${startYear + 1}-06-16`, end_date: `${startYear + 1}-08-31` };
}
