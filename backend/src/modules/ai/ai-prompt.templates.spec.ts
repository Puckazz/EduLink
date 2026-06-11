import {
  buildParentChatPrompt,
  shouldIncludeParentUsageGuide,
} from './ai-prompt.templates';
import type { StudentContext } from './ai-context.builder';

const context: StudentContext = {
  studentName: 'Nguyễn Văn B',
  studentCode: 'SV001',
  className: 'CNTT2024A',
  majorName: 'Công nghệ Thông tin',
  scores: [],
  attendances: [],
  schedule: [
    {
      subjectName: 'Trí tuệ Nhân tạo',
      subjectCode: 'INT302',
      classCode: 'DEMO-T6',
      teacherName: 'PGS.TS. Nguyễn Văn A',
      dayOfWeek: 'Thứ 6',
      startTime: '7:30',
      endTime: '11:45',
      room: 'A1.101',
      termName: 'Học kỳ II - 2025 - 2026',
      sessions: [],
    },
  ],
  recentNotifications: [],
};

describe('AI prompt templates', () => {
  it('does not include usage guide for student schedule data questions', () => {
    const message = 'Lịch học con tôi thế nào?';

    expect(shouldIncludeParentUsageGuide(message)).toBe(false);
    expect(buildParentChatPrompt(context, '', message)).not.toContain(
      'Hướng dẫn sử dụng EduLink cho phụ huynh',
    );
  });

  it('includes usage guide for feature how-to questions', () => {
    const message = 'Làm sao đổi ảnh đại diện?';

    expect(shouldIncludeParentUsageGuide(message)).toBe(true);
    expect(buildParentChatPrompt(context, '', message)).toContain(
      'Hướng dẫn sử dụng EduLink cho phụ huynh',
    );
    expect(buildParentChatPrompt(context, '', message)).toContain(
      'Đổi ảnh đại diện',
    );
  });
});
