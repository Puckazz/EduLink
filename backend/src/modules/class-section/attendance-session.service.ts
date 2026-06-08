import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BulkUpsertAttendanceDto } from './dto/bulk-upsert-attendance.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import {
  getAttendanceAccess,
  toVietnamDbDateOnly,
} from './attendance-time.helper';
import { AttendanceSummaryService } from './attendance-summary.service';

@Injectable()
export class AttendanceSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceSummary: AttendanceSummaryService,
  ) {}

  async findSessions(sectionId: number, teacherId?: number) {
    await this.ensureSectionExists(sectionId, teacherId);
    return this.prisma.attendanceSession.findMany({
      where: { section_id: sectionId },
      orderBy: { session_no: 'asc' },
      select: {
        session_id: true,
        session_no: true,
        session_date: true,
        note: true,
        _count: { select: { records: true } },
      },
    });
  }

  async createSession(
    sectionId: number,
    dto: CreateSessionDto,
    teacherId?: number,
  ) {
    const section = await this.ensureSectionExists(sectionId, teacherId);
    const sessionDate = new Date(dto.session_date);
    if (teacherId) {
      this.ensureSessionDateWithinTerm(sessionDate, section, 'tạo');
    }

    const exists = await this.prisma.attendanceSession.findUnique({
      where: {
        section_id_session_no: {
          section_id: sectionId,
          session_no: dto.session_no,
        },
      },
    });
    if (exists)
      throw new ConflictException(
        `Buổi số ${dto.session_no} đã tồn tại trong lớp này`,
      );

    const session = await this.prisma.attendanceSession.create({
      data: {
        section_id: sectionId,
        session_date: sessionDate,
        session_no: dto.session_no,
        note: dto.note,
      },
    });

    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { section_id: sectionId },
      select: { enrollment_id: true },
    });

    if (enrollments.length > 0) {
      await this.prisma.attendanceRecord.createMany({
        data: enrollments.map((e) => ({
          session_id: session.session_id,
          enrollment_id: e.enrollment_id,
          status: 'NONE' as const,
        })),
        skipDuplicates: true,
      });
    }

    await this.attendanceSummary.syncForSection(sectionId, section.term_id);

    return session;
  }

  async updateSession(
    sectionId: number,
    sessionId: number,
    dto: UpdateSessionDto,
    teacherId?: number,
  ) {
    const section = await this.ensureSectionExists(sectionId, teacherId);
    const session = await this.prisma.attendanceSession.findFirst({
      where: { session_id: sessionId, section_id: sectionId },
    });
    if (!session) throw new NotFoundException('Không tìm thấy buổi học');

    if (teacherId) {
      await this.ensureTeacherCanUpdateSession(sessionId);
      if (dto.session_date) {
        this.ensureSessionDateWithinTerm(
          new Date(dto.session_date),
          section,
          'sửa',
        );
      }
    }

    return this.prisma.attendanceSession.update({
      where: { session_id: sessionId },
      data: {
        ...(dto.session_date
          ? { session_date: new Date(dto.session_date) }
          : {}),
        ...(dto.note !== undefined ? { note: dto.note } : {}),
      },
      select: {
        session_id: true,
        session_no: true,
        session_date: true,
        note: true,
        _count: { select: { records: true } },
      },
    });
  }

  async deleteSession(
    sectionId: number,
    sessionId: number,
    teacherId?: number,
  ) {
    const section = await this.ensureSectionExists(sectionId, teacherId);
    const session = await this.prisma.attendanceSession.findFirst({
      where: { session_id: sessionId, section_id: sectionId },
    });
    if (!session) throw new NotFoundException('Không tìm thấy buổi học');

    await this.prisma.attendanceSession.delete({
      where: { session_id: sessionId },
    });

    // Sync Attendance summary after removing a session (total_sessions changes)
    await this.attendanceSummary.syncForSection(sectionId, section.term_id);

    return {
      message: 'Đã xóa buổi học và toàn bộ bản ghi điểm danh liên quan',
    };
  }

  async getSessionRecords(
    sessionId: number,
    page = 1,
    limit = 20,
    search?: string,
    teacherId?: number,
  ) {
    const session = await this.ensureSessionExists(sessionId, teacherId);
    const attendanceAccess = getAttendanceAccess(session.section, session, {
      isAdmin: !teacherId,
    });

    const skip = (page - 1) * limit;

    const where = {
      section_id: session.section_id,
      ...(search
        ? {
            student: {
              OR: [
                { full_name: { contains: search } },
                { student_code: { contains: search } },
              ],
            },
          }
        : {}),
    };

    const [total, statsTotal, enrollments, statusCounts] = await Promise.all([
      this.prisma.classEnrollment.count({ where }),
      this.prisma.classEnrollment.count({
        where: { section_id: session.section_id },
      }),
      this.prisma.classEnrollment.findMany({
        where,
        skip,
        take: limit,
        select: {
          enrollment_id: true,
          student: {
            select: {
              student_id: true,
              student_code: true,
              full_name: true,
              email: true,
            },
          },
          records: {
            where: { session_id: sessionId },
            select: {
              record_id: true,
              status: true,
              note: true,
              updated_at: true,
            },
          },
        },
        orderBy: {
          student: { full_name: 'asc' },
        },
      }),
      this.prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: { session_id: sessionId },
        _count: true,
      }),
    ]);

    const records = enrollments.map((e) => {
      const record = e.records[0];
      return {
        record_id: record?.record_id ?? 0,
        status: record?.status ?? 'NONE',
        note: record?.note ?? null,
        updated_at: record?.updated_at ?? new Date(),
        enrollment_id: e.enrollment_id,
        enrollment: {
          enrollment_id: e.enrollment_id,
          student: e.student,
        },
      };
    });

    const sessionStats = {
      total: statsTotal,
      present: 0,
      late: 0,
      absent: 0,
    };
    statusCounts.forEach((c) => {
      if (c.status === 'PRESENT') sessionStats.present = c._count;
      if (c.status === 'LATE') sessionStats.late = c._count;
      if (c.status === 'ABSENT') sessionStats.absent = c._count;
    });

    const currentSession = await this.prisma.attendanceSession.findUnique({
      where: { session_id: sessionId },
      select: { section_id: true, session_no: true },
    });

    let trend: {
      present: number | null;
      late: number | null;
      absent: number | null;
    } | null = null;

    const hasCurrentAttendanceData =
      sessionStats.present + sessionStats.late + sessionStats.absent > 0;

    if (
      hasCurrentAttendanceData &&
      currentSession &&
      currentSession.session_no > 1
    ) {
      const prevSession = await this.prisma.attendanceSession.findUnique({
        where: {
          section_id_session_no: {
            section_id: currentSession.section_id,
            session_no: currentSession.session_no - 1,
          },
        },
        select: { session_id: true },
      });

      if (prevSession) {
        const prevCounts = await this.prisma.attendanceRecord.groupBy({
          by: ['status'],
          where: { session_id: prevSession.session_id },
          _count: true,
        });

        const prevStats = { total: 0, present: 0, late: 0, absent: 0 };
        prevCounts.forEach((c) => {
          prevStats.total += c._count;
          if (c.status === 'PRESENT') prevStats.present = c._count;
          if (c.status === 'LATE') prevStats.late = c._count;
          if (c.status === 'ABSENT') prevStats.absent = c._count;
        });

        const calcDelta = (curr: number, prev: number): number | null => {
          if (prev === 0) return curr > 0 ? 100 : null;
          return Math.round(((curr - prev) / prev) * 100);
        };

        trend = {
          present: calcDelta(sessionStats.present, prevStats.present),
          late: calcDelta(sessionStats.late, prevStats.late),
          absent: calcDelta(sessionStats.absent, prevStats.absent),
        };
      }
    }

    return {
      data: records,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: sessionStats,
      trend,
      attendanceAccess,
    };
  }

  async bulkUpsertRecords(
    sessionId: number,
    dto: BulkUpsertAttendanceDto,
    teacherId?: number,
  ) {
    const session = await this.ensureSessionExists(sessionId, teacherId);
    const attendanceAccess = getAttendanceAccess(session.section, session, {
      isAdmin: !teacherId,
    });

    if (!attendanceAccess.canEditRecords) {
      throw new ForbiddenException(
        'Chưa đến giờ hoặc đã hết thời gian điểm danh.',
      );
    }

    await this.prisma.$transaction(
      dto.records.map((r) =>
        this.prisma.attendanceRecord.upsert({
          where: {
            session_id_enrollment_id: {
              session_id: sessionId,
              enrollment_id: r.enrollmentId,
            },
          },
          create: {
            session_id: sessionId,
            enrollment_id: r.enrollmentId,
            status: r.status,
            note: r.note ?? '',
          },
          update: {
            status: r.status,
            note: r.note ?? '',
          },
        }),
      ),
    );

    // Sync Attendance summary table for all affected students
    await this.attendanceSummary.syncForSection(
      session.section_id,
      session.section.term_id,
    );

    return {
      message: 'Điểm danh đã được lưu thành công',
      updated: dto.records.length,
    };
  }

  private async ensureSectionExists(sectionId: number, teacherId?: number) {
    const section = await this.prisma.classSection.findUnique({
      where: { section_id: sectionId },
      include: { term: true },
    });
    if (!section) throw new NotFoundException('Không tìm thấy lớp học phần');
    if (teacherId && section.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác trên lớp học phần này',
      );
    }
    return section;
  }

  private ensureSessionDateWithinTerm(
    sessionDate: Date,
    section: { term?: { start_date: Date; end_date: Date } | null },
    action: 'tạo' | 'sửa',
  ) {
    if (!section.term) {
      throw new ForbiddenException(
        'Lớp học phần chưa có thông tin học kỳ để kiểm tra lịch học',
      );
    }

    const dateOnly = toVietnamDbDateOnly(sessionDate).getTime();
    const termStart = toVietnamDbDateOnly(section.term.start_date).getTime();
    const termEnd = toVietnamDbDateOnly(section.term.end_date).getTime();

    if (dateOnly < termStart || dateOnly > termEnd) {
      throw new ForbiddenException(
        `Giáo viên chỉ được ${action} buổi học trong thời gian học kỳ.`,
      );
    }
  }

  private async ensureTeacherCanUpdateSession(sessionId: number) {
    const checkedInCount = await this.prisma.attendanceRecord.count({
      where: {
        session_id: sessionId,
        status: { in: ['PRESENT', 'LATE', 'ABSENT'] },
      },
    });

    if (checkedInCount > 0) {
      throw new ForbiddenException(
        'Buổi học đã có dữ liệu điểm danh, giáo viên không thể sửa lịch buổi này.',
      );
    }
  }

  private async ensureSessionExists(sessionId: number, teacherId?: number) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { session_id: sessionId },
      include: { section: { include: { term: true } } },
    });
    if (!session) throw new NotFoundException('Không tìm thấy buổi học');
    if (teacherId && session.section.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác trên buổi học này',
      );
    }
    return session;
  }
}
