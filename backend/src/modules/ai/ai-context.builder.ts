import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface StudentContext {
  studentName: string;
  studentCode: string;
  className: string | null;
  majorName: string | null;
  scores: Array<{
    subjectName: string;
    assignment: number | null;
    midterm: number | null;
    final: number | null;
    avg: number | null;
    termName: string;
  }>;
  attendances: Array<{
    termName: string;
    totalSessions: number;
    absentSessions: number;
    lateSessions: number;
  }>;
  schedule: Array<{
    subjectName: string;
    subjectCode: string;
    classCode: string;
    teacherName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
    termName: string;
    sessions: Array<{
      sessionNo: number;
      sessionDate: Date;
      note: string | null;
    }>;
  }>;
  recentNotifications: Array<{
    title: string;
    content: string;
    createdAt: Date;
  }>;
}

@Injectable()
export class AiContextBuilder {
  constructor(private readonly prisma: PrismaService) {}

  async validateOwnership(parentId: number, studentId: number): Promise<void> {
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
        'Bạn không có quyền xem thông tin sinh viên này',
      );
    }
  }

  async getStudentsForParent(parentId: number) {
    return this.prisma.studentParent.findMany({
      where: { parent_id: parentId },
      select: {
        student: {
          select: {
            student_id: true,
            student_code: true,
            full_name: true,
            class: true,
          },
        },
      },
    });
  }

  async buildStudentContext(
    parentId: number,
    studentId: number,
  ): Promise<StudentContext> {
    const student = await this.prisma.student.findUniqueOrThrow({
      where: { student_id: studentId },
      select: {
        full_name: true,
        student_code: true,
        class: true,
        major: { select: { major_name: true } },
      },
    });

    const [scores, attendances, schedule, notifications] = await Promise.all([
      this.prisma.score.findMany({
        where: { student_id: studentId, publish_status: 'PUBLISHED' },
        orderBy: { term: { start_date: 'desc' } },
        take: 20,
        select: {
          assignment: true,
          midterm: true,
          final: true,
          avg: true,
          subject: { select: { subject_name: true } },
          term: { select: { name: true } },
        },
      }),
      this.prisma.attendance.findMany({
        where: { student_id: studentId },
        orderBy: { term: { start_date: 'desc' } },
        take: 5,
        select: {
          total_sessions: true,
          absent_sessions: true,
          late_sessions: true,
          term: { select: { name: true } },
        },
      }),
      this.prisma.classSection.findMany({
        where: {
          enrollments: { some: { student_id: studentId } },
        },
        orderBy: [
          { term: { start_date: 'desc' } },
          { day_of_week: 'asc' },
          { start_time: 'asc' },
        ],
        take: 12,
        select: {
          class_code: true,
          teacher_name: true,
          day_of_week: true,
          start_time: true,
          end_time: true,
          room: true,
          subject: {
            select: {
              subject_code: true,
              subject_name: true,
            },
          },
          term: { select: { name: true } },
          sessions: {
            orderBy: { session_date: 'desc' },
            take: 4,
            select: {
              session_no: true,
              session_date: true,
              note: true,
            },
          },
        },
      }),
      this.prisma.notification.findMany({
        where: {
          OR: [
            { target_role: null, target_id: null },
            { target_role: 'parent', target_id: null },
            { target_role: 'parent', target_id: parentId },
          ],
        },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: { title: true, content: true, created_at: true },
      }),
    ]);

    return {
      studentName: student.full_name,
      studentCode: student.student_code,
      className: student.class,
      majorName: student.major?.major_name ?? null,
      scores: scores.map((s) => ({
        subjectName: s.subject.subject_name,
        assignment: s.assignment,
        midterm: s.midterm,
        final: s.final,
        avg: s.avg,
        termName: s.term.name,
      })),
      attendances: attendances.map((a) => ({
        termName: a.term.name,
        totalSessions: a.total_sessions,
        absentSessions: a.absent_sessions,
        lateSessions: a.late_sessions,
      })),
      schedule: schedule.map((section) => ({
        subjectName: section.subject.subject_name,
        subjectCode: section.subject.subject_code,
        classCode: section.class_code,
        teacherName: section.teacher_name,
        dayOfWeek: section.day_of_week,
        startTime: section.start_time,
        endTime: section.end_time,
        room: section.room,
        termName: section.term.name,
        sessions: section.sessions
          .slice()
          .sort((a, b) => a.session_no - b.session_no)
          .map((session) => ({
            sessionNo: session.session_no,
            sessionDate: session.session_date,
            note: session.note,
          })),
      })),
      recentNotifications: notifications.map((n) => ({
        title: n.title,
        content: n.content,
        createdAt: n.created_at,
      })),
    };
  }

  async validateConversationOwnership(
    parentId: number,
    conversationId: number,
  ) {
    const conversation = await this.prisma.chatConversation.findUnique({
      where: { conversation_id: conversationId },
    });
    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện này');
    }
    if (conversation.parent_id !== parentId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập cuộc trò chuyện này',
      );
    }
    return conversation;
  }

  async getChatHistory(conversationId: number, limit = 10) {
    return this.prisma.chatHistory.findMany({
      where: {
        conversation_id: conversationId,
      },
      orderBy: [{ created_at: 'desc' }, { chat_id: 'desc' }],
      take: limit,
      select: {
        role: true,
        content: true,
      },
    });
  }
}
