import {
  getAttendanceAccess,
  getEffectiveClassStatus,
} from './attendance-time.helper';

const term = {
  start_date: new Date('2025-01-01T00:00:00.000Z'),
  end_date: new Date('2025-01-31T00:00:00.000Z'),
};

const section = {
  start_time: '7:30',
  end_time: '9:30',
  term,
};

const session = {
  session_date: new Date('2025-01-06T00:00:00.000Z'),
};

describe('attendance-time.helper', () => {
  describe('getEffectiveClassStatus()', () => {
    it('returns UPCOMING before the term starts', () => {
      expect(
        getEffectiveClassStatus(term, new Date('2024-12-31T16:59:59.999Z')),
      ).toBe('UPCOMING');
    });

    it('returns ONGOING during the term', () => {
      expect(
        getEffectiveClassStatus(term, new Date('2025-01-01T17:00:00.000Z')),
      ).toBe('ONGOING');
    });

    it('returns FINISHED after the term ends', () => {
      expect(
        getEffectiveClassStatus(term, new Date('2025-01-31T17:00:00.000Z')),
      ).toBe('FINISHED');
    });
  });

  describe('getAttendanceAccess()', () => {
    it('opens exactly 15 minutes before class start', () => {
      const access = getAttendanceAccess(section, session, {
        now: new Date('2025-01-06T00:15:00.000Z'),
      });

      expect(access.canEditRecords).toBe(true);
      expect(access.reason).toBe('OPEN');
    });

    it('stays open exactly 30 minutes after class end', () => {
      const access = getAttendanceAccess(section, session, {
        now: new Date('2025-01-06T03:00:00.000Z'),
      });

      expect(access.canEditRecords).toBe(true);
      expect(access.reason).toBe('OPEN');
    });

    it('locks teacher after the close grace period', () => {
      const access = getAttendanceAccess(section, session, {
        now: new Date('2025-01-06T03:00:01.000Z'),
      });

      expect(access.canEditRecords).toBe(false);
      expect(access.reason).toBe('AFTER_WINDOW');
    });

    it('allows admin override outside the attendance window', () => {
      const access = getAttendanceAccess(section, session, {
        isAdmin: true,
        now: new Date('2025-01-06T03:00:01.000Z'),
      });

      expect(access.canEditRecords).toBe(true);
      expect(access.reason).toBe('ADMIN_OVERRIDE');
    });
  });
});
