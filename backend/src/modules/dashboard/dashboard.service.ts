import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /dashboard/admin – Thống kê tổng quan hệ thống
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
      // Tổng số sinh viên (chưa bị xoá mềm)
      this.prisma.student.count({ where: { deleted_at: null } }),
      // Tổng số phụ huynh
      this.prisma.parent.count(),
      // Tổng số thông báo đã gửi
      this.prisma.notification.count(),
      // Số phản hồi đang chờ (OPEN)
      this.prisma.feedback.count({ where: { status: 'OPEN' } }),
      // 5 phản hồi gần nhất
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
      // Danh sách các ngành + avg điểm của sinh viên trong ngành
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
      // Tổng hợp chuyên cần toàn hệ thống (Attendance model cũ)
      this.prisma.attendance.aggregate({
        _sum: {
          total_sessions: true,
          absent_sessions: true,
          late_sessions: true,
        },
      }),
    ]);

    // Tính GPA trung bình theo ngành
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
      .filter((m) => m.gpa > 0) // Chỉ hiện ngành có dữ liệu
      .slice(0, 6); // Tối đa 6 cột

    // Tổng hợp điểm danh cho chart donut
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

  // GET /dashboard/me – Thông tin tổng quan của phụ huynh (con, điểm, chuyên cần)
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
}
