import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  academicTermSelect,
  withEffectiveTermStatus,
} from '../academic-term/academic-term.service';
import { withEffectiveClassStatus } from '../class-section/attendance-time.helper';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private getGpaScale(avg: number): number {
    if (avg >= 8.5) return 4.0;
    if (avg >= 8.0) return 3.5;
    if (avg >= 7.0) return 3.0;
    if (avg >= 5.5) return 2.0;
    if (avg >= 4.0) return 1.0;
    return 0;
  }

  private computeGpa4(
    scores: Array<{ avg: number | null; subject?: { credit: number | null } }>,
  ) {
    const publishedScores = scores.filter((score) => score.avg !== null);
    if (publishedScores.length === 0) return null;

    let totalPoints = 0;
    let totalCredits = 0;

    publishedScores.forEach((score) => {
      const credits = score.subject?.credit ?? 3;
      totalPoints += this.getGpaScale(score.avg as number) * credits;
      totalCredits += credits;
    });

    if (totalCredits === 0) return null;
    return Math.round((totalPoints / totalCredits) * 100) / 100;
  }

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
      this.prisma.attendanceRecord.groupBy({
        by: ['status'],
        _count: true,
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

    const attendanceSummary = { present: 0, absent: 0, late: 0 };
    attendanceRows.forEach((row) => {
      if (row.status === 'PRESENT') attendanceSummary.present = row._count;
      if (row.status === 'ABSENT') attendanceSummary.absent = row._count;
      if (row.status === 'LATE') attendanceSummary.late = row._count;
    });

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
    const [studentLinks, notifications] = await Promise.all([
      this.prisma.studentParent.findMany({
        where: { parent_id: parentId },
        include: {
          student: {
            select: {
              student_id: true,
              student_code: true,
              full_name: true,
              class: true,
              status: true,
              study_year: true,
              major: { select: { major_name: true } },
              scores: {
                where: { publish_status: 'PUBLISHED' },
                orderBy: { created_at: 'desc' },
                select: {
                  score_id: true,
                  term_id: true,
                  term: {
                    select: academicTermSelect,
                  },
                  avg: true,
                  subject: {
                    select: {
                      subject_name: true,
                      subject_code: true,
                      credit: true,
                    },
                  },
                },
              },
              attendances: {
                orderBy: { created_at: 'desc' },
                take: 3,
                select: {
                  attendance_id: true,
                  term_id: true,
                  term: {
                    select: academicTermSelect,
                  },
                  total_sessions: true,
                  absent_sessions: true,
                  late_sessions: true,
                },
              },
            },
          },
        },
      }),
      this.notificationService.findForParent(parentId, 5),
    ]);

    const students = studentLinks.map((link) => ({
      student_id: link.student.student_id,
      student_code: link.student.student_code,
      full_name: link.student.full_name,
      class: link.student.class,
      status: link.student.status,
      study_year: link.student.study_year,
      major: link.student.major?.major_name ?? null,
      is_primary: link.is_primary,
      gpa_4: this.computeGpa4(link.student.scores),
      scores: link.student.scores.slice(0, 5).map((score) => ({
        ...score,
        term: withEffectiveTermStatus(score.term),
      })),
      attendances: link.student.attendances.map((attendance) => ({
        ...attendance,
        term: withEffectiveTermStatus(attendance.term),
      })),
    }));

    return { students, notifications };
  }

  async getTeacherDashboard(teacherId: number) {
    const [
      sections,
      attendanceCounts,
      incompleteSessions,
      recentNotifications,
    ] = await Promise.all([
      this.prisma.classSection.findMany({
        where: { teacher_id: teacherId },
        orderBy: [{ created_at: 'desc' }],
        select: {
          section_id: true,
          class_code: true,
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
      this.notificationService.findForTeacher(teacherId, 5),
    ]);

    const effectiveSections = sections.map((section) =>
      withEffectiveClassStatus(section),
    );

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
    const todayClasses = effectiveSections
      .filter((section) => todayLabels.includes(section.day_of_week))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    return {
      totalClasses: effectiveSections.length,
      ongoingClasses: effectiveSections.filter(
        (section) => section.effectiveStatus === 'ONGOING',
      ).length,
      totalStudents: effectiveSections.reduce(
        (sum, section) => sum + section._count.enrollments,
        0,
      ),
      totalSessions: effectiveSections.reduce(
        (sum, section) => sum + section._count.sessions,
        0,
      ),
      incompleteSessions,
      attendanceSummary,
      todayClasses,
      recentClasses: effectiveSections.slice(0, 5),
      recentNotifications,
    };
  }
}
