import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private getTodayDayLabels() {
    const day = new Date().getDay();
    const labels: Record<number, string[]> = {
      0: ['Chủ nhật', 'Chủ Nhật', 'CN', 'Sunday', 'Sun'],
      1: ['Thứ 2', 'Thứ Hai', 'T2', 'Monday', 'Mon'],
      2: ['Thứ 3', 'Thứ Ba', 'T3', 'Tuesday', 'Tue'],
      3: ['Thứ 4', 'Thứ Tư', 'T4', 'Wednesday', 'Wed'],
      4: ['Thứ 5', 'Thứ Năm', 'T5', 'Thursday', 'Thu'],
      5: ['Thứ 6', 'Thứ Sáu', 'T6', 'Friday', 'Fri'],
      6: ['Thứ 7', 'Thứ Bảy', 'T7', 'Saturday', 'Sat'],
    };
    return labels[day];
  }

  async getAdminStats() {
    const [
      totalStudents,
      totalParents,
      totalNotifications,
      pendingFeedbacks,
      recentFeedbacks,
      majors,
      attendanceRows,
    ] = await Promise.all([
      this.prisma.student.count({ where: { deleted_at: null } }),
      this.prisma.parent.count(),
      this.prisma.notification.count(),
      this.prisma.feedback.count({ where: { status: 'OPEN' } }),
      this.prisma.feedback.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          feedback_id: true,
          title: true,
          category: true,
          status: true,
          created_at: true,
          parent: { select: { full_name: true } },
        },
      }),
      this.prisma.major.findMany({
        select: {
          major_id: true,
          major_name: true,
          students: {
            where: { deleted_at: null },
            select: {
              scores: {
                where: { publish_status: 'PUBLISHED', avg: { not: null } },
                select: { avg: true },
              },
            },
          },
        },
      }),
      this.prisma.attendance.aggregate({
        _sum: {
          total_sessions: true,
          absent_sessions: true,
          late_sessions: true,
        },
      }),
    ]);

    const gpaByMajor = majors
      .map((major) => {
        const allAvgs = major.students.flatMap((s) =>
          s.scores.map((sc) => sc.avg as number),
        );
        const gpa =
          allAvgs.length > 0
            ? parseFloat(
                (allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(
                  2,
                ),
              )
            : 0;
        return { major: major.major_name, gpa };
      })
      .filter((m) => m.gpa > 0)
      .slice(0, 6);

    const totalSessions = attendanceRows._sum.total_sessions ?? 0;
    const absentSessions = attendanceRows._sum.absent_sessions ?? 0;
    const lateSessions = attendanceRows._sum.late_sessions ?? 0;
    const presentSessions = Math.max(
      0,
      totalSessions - absentSessions - lateSessions,
    );

    const attendanceSummary = {
      present: presentSessions,
      absent: absentSessions,
      late: lateSessions,
    };

    return {
      totalStudents,
      totalParents,
      totalNotifications,
      pendingFeedbacks,
      recentFeedbacks,
      gpaByMajor,
      attendanceSummary,
    };
  }

  async getParentDashboard(parentId: number) {
    const studentLinks = await this.prisma.studentParent.findMany({
      where: { parent_id: parentId },
      include: {
        student: {
          select: {
            student_id: true,
            student_code: true,
            full_name: true,
            class: true,
            status: true,
            major: { select: { major_name: true } },
            scores: {
              where: { publish_status: 'PUBLISHED' },
              orderBy: { created_at: 'desc' },
              take: 5,
              select: {
                score_id: true,
                semester: true,
                year: true,
                avg: true,
                subject: {
                  select: { subject_name: true, subject_code: true },
                },
              },
            },
            attendances: {
              orderBy: { created_at: 'desc' },
              take: 3,
              select: {
                attendance_id: true,
                semester: true,
                total_sessions: true,
                absent_sessions: true,
                late_sessions: true,
              },
            },
          },
        },
      },
    });

    const students = studentLinks.map((link) => ({
      student_id: link.student.student_id,
      student_code: link.student.student_code,
      full_name: link.student.full_name,
      class: link.student.class,
      status: link.student.status,
      major: link.student.major?.major_name ?? null,
      is_primary: link.is_primary,
      scores: link.student.scores,
      attendances: link.student.attendances,
    }));

    return { students };
  }

  async getTeacherDashboard(teacherId: number) {
    const [sections, attendanceCounts, incompleteSessions, recentNotifications] =
      await Promise.all([
        this.prisma.classSection.findMany({
          where: { teacher_id: teacherId },
          orderBy: [{ status: 'asc' }, { created_at: 'desc' }],
          select: {
            section_id: true,
            class_code: true,
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
              },
            },
            _count: { select: { enrollments: true, sessions: true } },
          },
        }),
        this.prisma.attendanceRecord.groupBy({
          by: ['status'],
          where: {
            session: {
              section: { teacher_id: teacherId },
            },
          },
          _count: true,
        }),
        this.prisma.attendanceSession.count({
          where: {
            section: { teacher_id: teacherId },
            records: { some: { status: 'NONE' } },
          },
        }),
        this.prisma.notification.findMany({
          where: {
            OR: [
              { target_role: null },
              { target_role: 'teacher', target_id: null },
              { target_role: 'teacher', target_id: teacherId },
            ],
          },
          orderBy: { created_at: 'desc' },
          take: 5,
          select: {
            notification_id: true,
            title: true,
            content: true,
            created_at: true,
            target_role: true,
            target_id: true,
            feedback_id: true,
            admin: { select: { full_name: true } },
          },
        }),
      ]);

    const attendanceSummary = {
      present: 0,
      late: 0,
      absent: 0,
      none: 0,
    };
    attendanceCounts.forEach((item) => {
      if (item.status === 'PRESENT') attendanceSummary.present = item._count;
      if (item.status === 'LATE') attendanceSummary.late = item._count;
      if (item.status === 'ABSENT') attendanceSummary.absent = item._count;
      if (item.status === 'NONE') attendanceSummary.none = item._count;
    });

    const todayLabels = this.getTodayDayLabels();
    const todayClasses = sections
      .filter((section) => todayLabels.includes(section.day_of_week))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    return {
      totalClasses: sections.length,
      ongoingClasses: sections.filter((section) => section.status === 'ONGOING')
        .length,
      totalStudents: sections.reduce(
        (sum, section) => sum + section._count.enrollments,
        0,
      ),
      totalSessions: sections.reduce(
        (sum, section) => sum + section._count.sessions,
        0,
      ),
      incompleteSessions,
      attendanceSummary,
      todayClasses,
      recentClasses: sections.slice(0, 5),
      recentNotifications,
    };
  }
}
