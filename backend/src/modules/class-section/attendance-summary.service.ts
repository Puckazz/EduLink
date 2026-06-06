import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttendanceSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async syncForSection(sectionId: number, termId: number) {
    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { section_id: sectionId },
      select: { student_id: true },
    });

    await this.syncForStudentsInTerm(
      enrollments.map((enrollment) => enrollment.student_id),
      termId,
    );
  }

  async syncForStudentsInTerm(studentIds: number[], termId: number) {
    const uniqueStudentIds = [...new Set(studentIds)];
    if (uniqueStudentIds.length === 0) return;

    for (const studentId of uniqueStudentIds) {
      await this.syncForStudentTerm(studentId, termId);
    }
  }

  async syncForStudentTerm(studentId: number, termId: number) {
    const enrollments = await this.prisma.classEnrollment.findMany({
      where: {
        student_id: studentId,
        section: { term_id: termId },
      },
      select: {
        enrollment_id: true,
        section: {
          select: {
            sessions: {
              select: { session_id: true },
            },
          },
        },
        records: {
          select: { status: true },
        },
      },
    });

    const totalSessions = enrollments.reduce(
      (sum, enrollment) => sum + enrollment.section.sessions.length,
      0,
    );
    const absentSessions = enrollments.reduce(
      (sum, enrollment) =>
        sum +
        enrollment.records.filter((record) => record.status === 'ABSENT')
          .length,
      0,
    );
    const lateSessions = enrollments.reduce(
      (sum, enrollment) =>
        sum +
        enrollment.records.filter((record) => record.status === 'LATE').length,
      0,
    );

    await this.prisma.attendance.upsert({
      where: {
        student_id_term_id: {
          student_id: studentId,
          term_id: termId,
        },
      },
      create: {
        student_id: studentId,
        term_id: termId,
        total_sessions: totalSessions,
        absent_sessions: absentSessions,
        late_sessions: lateSessions,
      },
      update: {
        total_sessions: totalSessions,
        absent_sessions: absentSessions,
        late_sessions: lateSessions,
      },
    });
  }
}
