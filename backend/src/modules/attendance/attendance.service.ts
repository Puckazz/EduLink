import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

const attendanceSelect = {
  attendance_id: true,
  semester: true,
  total_sessions: true,
  absent_sessions: true,
  created_at: true,
  student_id: true,
  student: {
    select: {
      student_id: true,
      student_code: true,
      full_name: true,
      class: true,
    },
  },
} satisfies Prisma.AttendanceSelect;

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Admin: Tạo chuyên cần cho sinh viên ──────────────────────────────────
  async createForStudent(studentId: number, dto: CreateAttendanceDto) {
    await this.ensureStudentExists(studentId);

    return this.prisma.attendance.create({
      data: {
        student_id: studentId,
        semester: dto.semester,
        total_sessions: dto.total_sessions ?? 0,
        absent_sessions: dto.absent_sessions ?? 0,
      },
      select: attendanceSelect,
    });
  }

  // ─── Admin: Lấy chuyên cần của một sinh viên ──────────────────────────────
  async findByStudent(studentId: number) {
    await this.ensureStudentExists(studentId);

    return this.prisma.attendance.findMany({
      where: { student_id: studentId },
      select: attendanceSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── Parent: Lấy chuyên cần của con em mình ───────────────────────────────
  async findByStudentForParent(studentId: number, parentId: number) {
    const student = await this.ensureStudentExists(studentId);

    const link = await this.prisma.studentParent.findUnique({
      where: {
        student_id_parent_id: {
          student_id: studentId,
          parent_id: parentId,
        },
      },
    });

    if (!link) {
      throw new ForbiddenException(
        'Bạn không có quyền xem chuyên cần của học sinh này',
      );
    }

    return this.prisma.attendance.findMany({
      where: { student_id: studentId },
      select: attendanceSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── Admin: Cập nhật bản ghi chuyên cần ───────────────────────────────────
  async update(id: number, dto: UpdateAttendanceDto) {
    await this.findOne(id);

    return this.prisma.attendance.update({
      where: { attendance_id: id },
      data: dto,
      select: attendanceSelect,
    });
  }

  // ─── Admin: Xóa bản ghi chuyên cần ───────────────────────────────────────
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.attendance.delete({
      where: { attendance_id: id },
      select: attendanceSelect,
    });
  }

  // ─── Private helpers ───────────────────────────────────────────────────────
  async findOne(id: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { attendance_id: id },
      select: attendanceSelect,
    });

    if (!attendance) {
      throw new NotFoundException('Không tìm thấy bản ghi chuyên cần');
    }

    return attendance;
  }

  private async ensureStudentExists(studentId: number) {
    const student = await this.prisma.student.findFirst({
      where: { student_id: studentId, deleted_at: null },
      select: { student_id: true },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh');
    }

    return student;
  }
}
