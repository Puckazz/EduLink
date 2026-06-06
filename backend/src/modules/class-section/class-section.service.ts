import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassSectionDto } from './dto/create-class-section.dto';
import { UpdateClassSectionDto } from './dto/update-class-section.dto';
import { ClassSectionListQueryDto } from './dto/class-section-list-query.dto';
import {
  buildClassSectionListQuery,
  buildPaginationMeta,
} from './class-section-query.helper';
import { academicTermSelect } from '../academic-term/academic-term.service';
import { withEffectiveClassStatus } from './attendance-time.helper';
import { AttendanceSummaryService } from './attendance-summary.service';

const sectionSelect = {
  section_id: true,
  class_code: true,
  teacher_id: true,
  teacher_name: true,
  day_of_week: true,
  start_time: true,
  end_time: true,
  room: true,
  term_id: true,
  term: {
    select: academicTermSelect,
  },
  created_at: true,
  subject: {
    select: { subject_id: true, subject_code: true, subject_name: true },
  },
  _count: { select: { enrollments: true, sessions: true } },
} as const;

@Injectable()
export class ClassSectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceSummary: AttendanceSummaryService,
  ) {}

  async findAll(
    query: ClassSectionListQueryDto = new ClassSectionListQueryDto(),
    teacherId?: number,
  ) {
    const { where, orderBy, skip, take, page, limit } =
      buildClassSectionListQuery(query, teacherId);

    const [sections, total] = await this.prisma.$transaction([
      this.prisma.classSection.findMany({
        where,
        select: sectionSelect,
        orderBy,
        skip,
        take,
      }),
      this.prisma.classSection.count({ where }),
    ]);

    return {
      data: sections.map((section) => withEffectiveClassStatus(section)),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: number, teacherId?: number) {
    const section = await this.prisma.classSection.findUnique({
      where: { section_id: id },
      select: sectionSelect,
    });
    if (!section) throw new NotFoundException('Không tìm thấy lớp học phần');
    if (teacherId && section.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập lớp học phần này',
      );
    }
    return withEffectiveClassStatus(section);
  }

  async findAllTeachers() {
    return this.prisma.teacher.findMany({
      select: {
        teacher_id: true,
        full_name: true,
        username: true,
        email: true,
      },
      orderBy: { full_name: 'asc' },
    });
  }

  async create(dto: CreateClassSectionDto) {
    const exists = await this.prisma.classSection.findUnique({
      where: { class_code: dto.class_code },
    });
    if (exists)
      throw new ConflictException(`Mã lớp "${dto.class_code}" đã tồn tại`);

    await this.ensureSubjectExists(dto.subject_id);
    await this.ensureTermExists(dto.term_id);

    let teacherId: number | null = dto.teacher_id ?? null;
    let teacherName: string = dto.teacher_name ?? '';

    if (dto.teacher_id) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { teacher_id: dto.teacher_id },
      });
      if (!teacher) {
        throw new NotFoundException('Không tìm thấy giảng viên');
      }
      teacherId = teacher.teacher_id;
      teacherName = teacher.full_name || dto.teacher_name || '';
    } else if (dto.teacher_name) {
      const teacher = await this.prisma.teacher.findFirst({
        where: { full_name: dto.teacher_name },
      });
      if (teacher) {
        teacherId = teacher.teacher_id;
        teacherName = teacher.full_name || dto.teacher_name;
      }
    }

    if (!teacherName) {
      throw new BadRequestException(
        'Vui lòng chọn giảng viên hoặc cung cấp tên giảng viên',
      );
    }

    const section = await this.prisma.classSection.create({
      data: {
        class_code: dto.class_code,
        teacher_name: teacherName,
        teacher_id: teacherId,
        day_of_week: dto.day_of_week,
        start_time: dto.start_time,
        end_time: dto.end_time,
        room: dto.room,
        term_id: dto.term_id,
        subject_id: dto.subject_id,
      },
      select: sectionSelect,
    });

    return withEffectiveClassStatus(section);
  }

  async update(id: number, dto: UpdateClassSectionDto) {
    const existing = await this.findOne(id);
    if (dto.subject_id) await this.ensureSubjectExists(dto.subject_id);
    if (dto.term_id) await this.ensureTermExists(dto.term_id);

    let teacherId =
      dto.teacher_id !== undefined ? dto.teacher_id : existing.teacher_id;
    let teacherName =
      dto.teacher_name !== undefined ? dto.teacher_name : existing.teacher_name;

    if (dto.teacher_id) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { teacher_id: dto.teacher_id },
      });
      if (!teacher) {
        throw new NotFoundException('Không tìm thấy giảng viên');
      }
      teacherId = teacher.teacher_id;
      teacherName =
        teacher.full_name || dto.teacher_name || existing.teacher_name;
    } else if (dto.teacher_name) {
      const teacher = await this.prisma.teacher.findFirst({
        where: { full_name: dto.teacher_name },
      });
      if (teacher) {
        teacherId = teacher.teacher_id;
        teacherName = teacher.full_name || dto.teacher_name;
      }
    }

    const rest = { ...dto };
    delete rest.teacher_id;
    delete rest.teacher_name;

    const section = await this.prisma.classSection.update({
      where: { section_id: id },
      data: {
        ...rest,
        teacher_id: teacherId,
        teacher_name: teacherName ?? '',
      },
      select: sectionSelect,
    });

    return withEffectiveClassStatus(section);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    const affectedEnrollments = await this.prisma.classEnrollment.findMany({
      where: { section_id: id },
      select: { student_id: true },
    });
    const section = await this.prisma.classSection.delete({
      where: { section_id: id },
      select: sectionSelect,
    });

    await this.attendanceSummary.syncForStudentsInTerm(
      affectedEnrollments.map((enrollment) => enrollment.student_id),
      existing.term_id,
    );

    return withEffectiveClassStatus(section);
  }

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

  async findEnrolledSectionsForParent(
    studentId: number,
    parentId: number,
    termId?: number,
    academicYearId?: number,
  ) {
    const link = await this.prisma.studentParent.findUnique({
      where: {
        student_id_parent_id: { student_id: studentId, parent_id: parentId },
      },
    });
    if (!link) {
      throw new ForbiddenException(
        'Bạn không có quyền xem thông tin của học sinh này',
      );
    }

    const sections = await this.prisma.classSection.findMany({
      where: {
        ...(termId
          ? { term_id: termId }
          : academicYearId
            ? { term: { academic_year_id: academicYearId } }
            : {}),
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
        term_id: true,
        term: {
          select: academicTermSelect,
        },
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

    return sections.map((section) => withEffectiveClassStatus(section));
  }

  private async ensureSubjectExists(subjectId: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { subject_id: subjectId },
    });
    if (!subject)
      throw new NotFoundException('Không tìm thấy môn học (subject_id)');
    return subject;
  }

  private async ensureTermExists(termId: number) {
    const term = await this.prisma.academicTerm.findUnique({
      where: { term_id: termId },
    });
    if (!term) throw new NotFoundException('Không tìm thấy học kỳ');
    return term;
  }

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

  async addEnrollments(sectionId: number, studentIds: number[]) {
    await this.findOne(sectionId);

    const students = await this.prisma.student.findMany({
      where: { student_id: { in: studentIds } },
      select: { student_id: true },
    });
    if (students.length !== studentIds.length) {
      throw new NotFoundException(
        'Một hoặc nhiều sinh viên không tồn tại trong hệ thống',
      );
    }

    await this.prisma.classEnrollment.createMany({
      data: studentIds.map((sid) => ({
        section_id: sectionId,
        student_id: sid,
      })),
      skipDuplicates: true,
    });

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

    const section = await this.prisma.classSection.findUnique({
      where: { section_id: sectionId },
      select: { term_id: true },
    });
    if (section) {
      await this.attendanceSummary.syncForStudentsInTerm(
        studentIds,
        section.term_id,
      );
    }

    return {
      message: `Đã thêm ${studentIds.length} sinh viên vào lớp`,
      added: studentIds.length,
    };
  }

  async removeEnrollment(sectionId: number, enrollmentId: number) {
    const enroll = await this.prisma.classEnrollment.findFirst({
      where: { enrollment_id: enrollmentId, section_id: sectionId },
      include: { section: { select: { term_id: true } } },
    });
    if (!enroll)
      throw new NotFoundException('Không tìm thấy thông tin đăng ký học phần');

    await this.prisma.classEnrollment.delete({
      where: { enrollment_id: enrollmentId },
    });
    await this.attendanceSummary.syncForStudentTerm(
      enroll.student_id,
      enroll.section.term_id,
    );
    return { message: 'Đã xóa sinh viên khỏi lớp học phần' };
  }
}
