import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BulkUpsertAttendanceDto } from './dto/bulk-upsert-attendance.dto';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class AttendanceSessionService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /class-sections/:sectionId/sessions — Danh sách buổi học
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
        publish_status: true,
        _count: { select: { records: true } },
      },
    });
  }

  // PATCH /class-sections/:sectionId/sessions/:sessionId/publish — Toggle publish status
  async publishSession(sessionId: number, teacherId?: number) {
    const session = await this.ensureSessionExists(sessionId, teacherId);
    const newStatus = session.publish_status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    return this.prisma.attendanceSession.update({
      where: { session_id: sessionId },
      data: { publish_status: newStatus },
      select: {
        session_id: true,
        session_no: true,
        session_date: true,
        publish_status: true,
      },
    });
  }

  // POST /class-sections/:sectionId/sessions — Tạo buổi học mới
  async createSession(sectionId: number, dto: CreateSessionDto, teacherId?: number) {
    await this.ensureSectionExists(sectionId, teacherId);

    const exists = await this.prisma.attendanceSession.findUnique({
      where: { section_id_session_no: { section_id: sectionId, session_no: dto.session_no } },
    });
    if (exists)
      throw new ConflictException(`Buổi số ${dto.session_no} đã tồn tại trong lớp này`);

    // Tạo buổi học và auto-tạo records rỗng cho tất cả SV trong lớp
    const session = await this.prisma.attendanceSession.create({
      data: {
        section_id: sectionId,
        session_date: new Date(dto.session_date),
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

    return session;
  }

  // GET /sessions/:sessionId/records — Điểm danh chi tiết 1 buổi (có phân trang)
  async getSessionRecords(
    sessionId: number,
    page = 1,
    limit = 20,
    search?: string,
    teacherId?: number,
  ) {
    await this.ensureSessionExists(sessionId, teacherId);

    const skip = (page - 1) * limit;
    const where = {
      session_id: sessionId,
      ...(search
        ? {
            enrollment: {
              student: {
                OR: [
                  { full_name: { contains: search } },
                  { student_code: { contains: search } },
                ],
              },
            },
          }
        : {}),
    };

    const [total, records] = await Promise.all([
      this.prisma.attendanceRecord.count({ where }),
      this.prisma.attendanceRecord.findMany({
        where,
        skip,
        take: limit,
        select: {
          record_id: true,
          status: true,
          note: true,
          updated_at: true,
          enrollment_id: true,
          enrollment: {
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
            },
          },
        },
        orderBy: {
          enrollment: { student: { full_name: 'asc' } },
        },
      }),
    ]);

    return {
      data: records,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // PUT /sessions/:sessionId/records — Lưu điểm danh hàng loạt (bulk upsert)
  async bulkUpsertRecords(sessionId: number, dto: BulkUpsertAttendanceDto, teacherId?: number) {
    await this.ensureSessionExists(sessionId, teacherId);

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

    return { message: 'Điểm danh đã được lưu thành công', updated: dto.records.length };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────
  private async ensureSectionExists(sectionId: number, teacherId?: number) {
    const section = await this.prisma.classSection.findUnique({
      where: { section_id: sectionId },
    });
    if (!section) throw new NotFoundException('Không tìm thấy lớp học phần');
    if (teacherId && section.teacher_id !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên lớp học phần này');
    }
    return section;
  }

  private async ensureSessionExists(sessionId: number, teacherId?: number) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { session_id: sessionId },
      include: { section: true },
    });
    if (!session) throw new NotFoundException('Không tìm thấy buổi học');
    if (teacherId && session.section.teacher_id !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên buổi học này');
    }
    return session;
  }
}
