import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClassStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassSectionDto } from './dto/create-class-section.dto';
import { UpdateClassSectionDto } from './dto/update-class-section.dto';

const sectionSelect = {
  section_id: true,
  class_code: true,
  teacher_id: true,
  teacher_name: true,
  day_of_week: true,
  start_time: true,
  end_time: true,
  room: true,
  semester: true,
  status: true,
  created_at: true,
  subject: {
    select: { subject_id: true, subject_code: true, subject_name: true },
  },
  _count: { select: { enrollments: true, sessions: true } },
} as const;

@Injectable()
export class ClassSectionService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /class-sections?semester=&status=
  async findAll(semester?: string, status?: ClassStatus, teacherId?: number) {
    return this.prisma.classSection.findMany({
      where: {
        ...(semester ? { semester } : {}),
        ...(status ? { status } : {}),
        ...(teacherId ? { teacher_id: teacherId } : {}),
      },
      select: sectionSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  // GET /class-sections/:id
  async findOne(id: number, teacherId?: number) {
    const section = await this.prisma.classSection.findUnique({
      where: { section_id: id },
      select: sectionSelect,
    });
    if (!section) throw new NotFoundException('Không tìm thấy lớp học phần');
    // Nếu có truyền teacherId (nghĩa là đang gọi từ role teacher), phải đảm bảo lớp này là của teacher đó.
    if (teacherId && section.teacher_id !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền truy cập lớp học phần này');
    }
    return section;
  }

  // POST /class-sections
  async create(dto: CreateClassSectionDto) {
    const exists = await this.prisma.classSection.findUnique({
      where: { class_code: dto.class_code },
    });
    if (exists)
      throw new ConflictException(`Mã lớp "${dto.class_code}" đã tồn tại`);

    await this.ensureSubjectExists(dto.subject_id);

    return this.prisma.classSection.create({
      data: {
        class_code: dto.class_code,
        teacher_name: dto.teacher_name,
        day_of_week: dto.day_of_week,
        start_time: dto.start_time,
        end_time: dto.end_time,
        room: dto.room,
        semester: dto.semester,
        status: dto.status ?? 'UPCOMING',
        subject_id: dto.subject_id,
      },
      select: sectionSelect,
    });
  }

  // PATCH /class-sections/:id
  async update(id: number, dto: UpdateClassSectionDto) {
    await this.findOne(id);
    return this.prisma.classSection.update({
      where: { section_id: id },
      data: dto,
      select: sectionSelect,
    });
  }

  // DELETE /class-sections/:id
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.classSection.delete({
      where: { section_id: id },
      select: sectionSelect,
    });
  }

  // GET /class-sections/:id/stats — Thống kê điểm danh của lớp
  async getStats(id: number, teacherId?: number) {
    await this.findOne(id, teacherId);

    const [totalStudents, sessions] = await Promise.all([
      this.prisma.classEnrollment.count({ where: { section_id: id } }),
      this.prisma.attendanceSession.findMany({
        where: { section_id: id },
        select: {
          session_id: true,
          session_no: true,
          session_date: true,
          records: {
            select: { status: true },
          },
        },
      }),
    ]);

    const totalSessions = sessions.length;
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;

    for (const session of sessions) {
      for (const r of session.records) {
        if (r.status === 'PRESENT') totalPresent++;
        else if (r.status === 'LATE') totalLate++;
        else if (r.status === 'ABSENT') totalAbsent++;
      }
    }

    return {
      totalStudents,
      totalSessions,
      totalPresent,
      totalLate,
      totalAbsent,
    };
  }

  // GET /me/students/:id/class-sections — Parent xem lịch học & điểm danh lớp của con
  async findEnrolledSectionsForParent(
    studentId: number,
    parentId: number,
    semester?: string,
  ) {
    // Verify parent-student relationship
    const link = await this.prisma.studentParent.findUnique({
      where: {
        student_id_parent_id: { student_id: studentId, parent_id: parentId },
      },
    });
    if (!link) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin của học sinh này');
    }

    return this.prisma.classSection.findMany({
      where: {
        ...(semester ? { semester } : {}),
        enrollments: { some: { student_id: studentId } },
      },
      select: {
        section_id: true,
        class_code: true,
        teacher_name: true,
        day_of_week: true,
        start_time: true,
        end_time: true,
        room: true,
        semester: true,
        status: true,
        subject: {
          select: {
            subject_id: true,
            subject_code: true,
            subject_name: true,
            credit: true,
          },
        },
        sessions: {
          select: {
            session_id: true,
            session_no: true,
            session_date: true,
            note: true,
            records: {
              where: { enrollment: { student_id: studentId } },
              select: {
                record_id: true,
                status: true,
                note: true,
                updated_at: true,
              },
            },
          },
          orderBy: { session_no: 'asc' as const },
        },
      },
      orderBy: { created_at: 'desc' as const },
    });
  }

  private async ensureSubjectExists(subjectId: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { subject_id: subjectId },
    });
    if (!subject)
      throw new NotFoundException('Không tìm thấy môn học (subject_id)');
    return subject;
  }

  // ── Enrollment ──────────────────────────────────────────────────────────────

  // GET /class-sections/:id/enrollments
  async getEnrollments(sectionId: number) {
    await this.findOne(sectionId);
    return this.prisma.classEnrollment.findMany({
      where: { section_id: sectionId },
      select: {
        enrollment_id: true,
        enrolled_at: true,
        student: {
          select: {
            student_id: true,
            student_code: true,
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: { student: { full_name: 'asc' } },
    });
  }

  // POST /class-sections/:id/enrollments  { studentIds: number[] }
  async addEnrollments(sectionId: number, studentIds: number[]) {
    await this.findOne(sectionId);

    // Validate all students exist
    const students = await this.prisma.student.findMany({
      where: { student_id: { in: studentIds } },
      select: { student_id: true },
    });
    if (students.length !== studentIds.length) {
      throw new NotFoundException('Một hoặc nhiều sinh viên không tồn tại trong hệ thống');
    }

    // Create enrollments (skip duplicates)
    await this.prisma.classEnrollment.createMany({
      data: studentIds.map((sid) => ({ section_id: sectionId, student_id: sid })),
      skipDuplicates: true,
    });

    // Auto-create NONE records for all existing sessions
    const sessions = await this.prisma.attendanceSession.findMany({
      where: { section_id: sectionId },
      select: { session_id: true },
    });

    if (sessions.length > 0) {
      const newEnrollments = await this.prisma.classEnrollment.findMany({
        where: { section_id: sectionId, student_id: { in: studentIds } },
        select: { enrollment_id: true },
      });
      const recordData = sessions.flatMap((sess) =>
        newEnrollments.map((enroll) => ({
          session_id: sess.session_id,
          enrollment_id: enroll.enrollment_id,
          status: 'NONE' as const,
        })),
      );
      if (recordData.length > 0) {
        await this.prisma.attendanceRecord.createMany({
          data: recordData,
          skipDuplicates: true,
        });
      }
    }

    return { message: `Đã thêm ${studentIds.length} sinh viên vào lớp`, added: studentIds.length };
  }

  // DELETE /class-sections/:id/enrollments/:eid
  async removeEnrollment(sectionId: number, enrollmentId: number) {
    const enroll = await this.prisma.classEnrollment.findFirst({
      where: { enrollment_id: enrollmentId, section_id: sectionId },
    });
    if (!enroll) throw new NotFoundException('Không tìm thấy thông tin đăng ký học phần');

    await this.prisma.classEnrollment.delete({ where: { enrollment_id: enrollmentId } });
    return { message: 'Đã xóa sinh viên khỏi lớp học phần' };
  }
}
