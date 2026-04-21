import {
  ConflictException,
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
  async findAll(semester?: string, status?: ClassStatus) {
    return this.prisma.classSection.findMany({
      where: {
        ...(semester ? { semester } : {}),
        ...(status ? { status } : {}),
      },
      select: sectionSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  // GET /class-sections/:id
  async findOne(id: number) {
    const section = await this.prisma.classSection.findUnique({
      where: { section_id: id },
      select: sectionSelect,
    });
    if (!section) throw new NotFoundException('Không tìm thấy lớp học phần');
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
  async getStats(id: number) {
    await this.findOne(id);

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

  private async ensureSubjectExists(subjectId: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { subject_id: subjectId },
    });
    if (!subject)
      throw new NotFoundException('Không tìm thấy môn học (subject_id)');
    return subject;
  }
}
