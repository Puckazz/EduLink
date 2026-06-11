import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import {
  createMockAcademicTerm,
  createMockNotification,
  createMockStudent,
} from '../../common/testing/test-data.factory';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaMock: PrismaMock;
  let notificationServiceMock: {
    findForParent: jest.Mock;
    findForTeacher: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    notificationServiceMock = {
      findForParent: jest.fn().mockResolvedValue([]),
      findForTeacher: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAdminStats()', () => {
    const mockRecentFeedback = {
      feedback_id: 1,
      title: 'Góp ý',
      category: 'HOC_TAP',
      status: 'OPEN',
      created_at: new Date(),
      parent: { full_name: 'Trần Thị B' },
    };

    const mockMajors = [
      {
        major_id: 1,
        major_name: 'Công nghệ thông tin',
        students: [
          { scores: [{ avg: 8.0 }, { avg: 7.5 }] },
          { scores: [{ avg: 9.0 }] },
        ],
      },
      {
        major_id: 2,
        major_name: 'Kinh tế',
        students: [],
      },
    ];

    beforeEach(() => {
      prismaMock.student.count.mockResolvedValue(150);
      prismaMock.parent.count.mockResolvedValue(120);
      prismaMock.notification.count.mockResolvedValue(30);
      prismaMock.feedback.count.mockResolvedValue(5);
      prismaMock.feedback.findMany.mockResolvedValue([mockRecentFeedback]);
      prismaMock.major.findMany.mockResolvedValue(mockMajors as any);
      prismaMock.attendanceRecord.groupBy.mockResolvedValue([
        { status: 'PRESENT', _count: 85 },
        { status: 'ABSENT', _count: 10 },
        { status: 'LATE', _count: 5 },
      ] as any);
    });

    it('should return correct aggregate statistics', async () => {
      const result = await service.getAdminStats();

      expect(result.totalStudents).toBe(150);
      expect(result.totalParents).toBe(120);
      expect(result.totalNotifications).toBe(30);
      expect(result.pendingFeedbacks).toBe(5);
    });

    it('should compute GPA by major and filter out majors with no data', async () => {
      prismaMock.academicTerm.findMany.mockResolvedValue([] as any);
      const result = await service.getGpaByMajor();

      expect(result.gpaByMajor).toHaveLength(1);
      expect(result.gpaByMajor[0].major).toBe('Công nghệ thông tin');
      expect(result.gpaByMajor[0].gpa).toBeCloseTo(8.17, 1);
    });

    it('should compute attendance summary correctly', async () => {
      const result = await service.getAdminStats();

      expect(result.attendanceSummary.absent).toBe(10);
      expect(result.attendanceSummary.late).toBe(5);
      expect(result.attendanceSummary.present).toBe(85);
    });

    it('should return 5 most recent feedbacks', async () => {
      const result = await service.getAdminStats();
      expect(result.recentFeedbacks).toHaveLength(1);
      expect(result.recentFeedbacks[0].title).toBe('Góp ý');
    });

    it('should handle null attendance aggregate values gracefully', async () => {
      prismaMock.attendanceRecord.groupBy.mockResolvedValue([] as any);

      const result = await service.getAdminStats();
      expect(result.attendanceSummary.present).toBe(0);
      expect(result.attendanceSummary.absent).toBe(0);
      expect(result.attendanceSummary.late).toBe(0);
    });
  });

  describe('getParentDashboard()', () => {
    const mockStudentLinks = [
      {
        is_primary: true,
        student: {
          ...createMockStudent(),
          major: { major_name: 'CNTT' },
          scores: [
            {
              score_id: 1,
              term_id: 1,
              term: createMockAcademicTerm(),
              semester: 'HK1-2024',
              year: 2024,
              avg: 8.0,
              subject: {
                subject_name: 'Lập trình',
                subject_code: 'CS101',
                credit: 3,
              },
            },
          ],
          attendances: [
            {
              attendance_id: 1,
              term_id: 1,
              term: createMockAcademicTerm(),
              semester: 'HK1-2024',
              total_sessions: 30,
              absent_sessions: 2,
              late_sessions: 1,
            },
          ],
        },
      },
    ];

    beforeEach(() => {
      prismaMock.score.findMany.mockImplementation((args?: any) => {
        if (args?.select?.score_id) {
          return Promise.resolve(
            mockStudentLinks[0].student.scores.map((score) => ({
              ...score,
              student_id: mockStudentLinks[0].student.student_id,
            })),
          );
        }

        return Promise.resolve([
          {
            student_id: mockStudentLinks[0].student.student_id,
            avg: 8.0,
            subject: {
              credit: 3,
            },
          },
        ]);
      });
      prismaMock.attendance.findMany.mockResolvedValue(
        mockStudentLinks[0].student.attendances.map((attendance) => ({
          ...attendance,
          student_id: mockStudentLinks[0].student.student_id,
        })) as any,
      );
    });

    it('should return dashboard data for parent with linked students', async () => {
      prismaMock.studentParent.findMany.mockResolvedValue(
        mockStudentLinks as any,
      );
      notificationServiceMock.findForParent.mockResolvedValue([
        createMockNotification(),
      ] as any);

      const result = await service.getParentDashboard(100);

      expect(result.students).toHaveLength(1);
      expect(result.students[0].is_primary).toBe(true);
      expect(result.students[0].scores).toHaveLength(1);
      expect(result.students[0].attendances).toHaveLength(1);
      expect(result.notifications).toHaveLength(1);
      expect(prismaMock.score.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            student_id: {
              in: [mockStudentLinks[0].student.student_id],
            },
          }),
        }),
      );
    });

    it('should return empty students list when parent has no linked students', async () => {
      prismaMock.studentParent.findMany.mockResolvedValue([]);
      notificationServiceMock.findForParent.mockResolvedValue([]);

      const result = await service.getParentDashboard(100);
      expect(result.students).toHaveLength(0);
    });

    it('should map major_name correctly from student relation', async () => {
      prismaMock.studentParent.findMany.mockResolvedValue(
        mockStudentLinks as any,
      );
      notificationServiceMock.findForParent.mockResolvedValue([]);

      const result = await service.getParentDashboard(100);
      expect(result.students[0].major).toBe('CNTT');
    });

    it('should include real student year, status and cumulative GPA', async () => {
      prismaMock.studentParent.findMany.mockResolvedValue(
        mockStudentLinks as any,
      );
      notificationServiceMock.findForParent.mockResolvedValue([]);

      const result = await service.getParentDashboard(100);

      expect(result.students[0].study_year).toBe(
        mockStudentLinks[0].student.study_year,
      );
      expect(result.students[0].status).toBe(
        mockStudentLinks[0].student.status,
      );
      expect(result.students[0].gpa_4).toBe(3.5);
    });
  });

  describe('getTeacherDashboard()', () => {
    const mockSections = [
      {
        section_id: 1,
        class_code: 'L01',
        day_of_week: 'Thứ 2',
        start_time: '07:30',
        end_time: '09:30',
        room: 'A1.202',
        semester: 'HK1-2024',
        term: {
          start_date: new Date('2025-09-01'),
          end_date: new Date('2026-01-15'),
        },
        subject: {
          subject_id: 1,
          subject_code: 'CS101',
          subject_name: 'Lập trình',
        },
        _count: { enrollments: 35, sessions: 10 },
      },
      {
        section_id: 2,
        class_code: 'L02',
        day_of_week: 'Thứ 4',
        start_time: '13:00',
        end_time: '15:00',
        room: 'B2.101',
        semester: 'HK1-2024',
        term: {
          start_date: new Date('2024-09-01'),
          end_date: new Date('2025-01-15'),
        },
        subject: {
          subject_id: 2,
          subject_code: 'DB101',
          subject_name: 'Cơ sở dữ liệu',
        },
        _count: { enrollments: 30, sessions: 8 },
      },
    ];

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-10-01T00:00:00.000Z'));
      prismaMock.classSection.findMany.mockResolvedValue(mockSections as any);
      prismaMock.attendanceRecord.groupBy.mockResolvedValue([
        { status: 'PRESENT', _count: 55 },
        { status: 'LATE', _count: 4 },
        { status: 'ABSENT', _count: 6 },
        { status: 'NONE', _count: 3 },
      ] as any);
      prismaMock.attendanceSession.count.mockResolvedValue(2);
      notificationServiceMock.findForTeacher.mockResolvedValue([
        {
          notification_id: 1,
          title: 'Thông báo',
          content: 'Nội dung',
          created_at: new Date(),
          target_role: 'teacher',
          target_id: null,
          feedback_id: null,
          admin: { full_name: 'Admin' },
        },
      ] as any);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return teacher class and attendance aggregates', async () => {
      const result = await service.getTeacherDashboard(1);

      expect(result.totalClasses).toBe(2);
      expect(result.ongoingClasses).toBe(1);
      expect(result.totalStudents).toBe(65);
      expect(result.totalSessions).toBe(18);
      expect(result.incompleteSessions).toBe(2);
      expect(result.attendanceSummary.present).toBe(55);
      expect(result.attendanceSummary.none).toBe(3);
    });

    it('should return recent classes and notifications', async () => {
      const result = await service.getTeacherDashboard(1);

      expect(result.recentClasses).toHaveLength(2);
      expect(result.recentNotifications).toHaveLength(1);
      expect(result.recentNotifications[0].title).toBe('Thông báo');
    });
  });
});
