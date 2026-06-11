import { FeedbackStatus } from '@prisma/client';

export const FEEDBACK_CATEGORY_LABELS: Record<string, string> = {
  HOC_TAP: 'Học tập & Điểm số',
  TAI_CHINH: 'Tài chính & Học phí',
  THOI_KHOA_BIEU: 'Thời khóa biểu',
  KY_LUAT: 'Kỷ luật',
  KY_TUC_XA: 'Ký túc xá',
  SUC_KHOE: 'Sức khỏe',
  HOAT_DONG: 'Hoạt động ngoại khóa',
  KHAC: 'Khác',
};

export const FEEDBACK_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Chờ xử lý',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã giải quyết',
};

export const ACTIVE_FEEDBACK_STATUSES: FeedbackStatus[] = [
  FeedbackStatus.OPEN,
  FeedbackStatus.IN_PROGRESS,
];

export const PARENT_USAGE_GUIDE = [
  {
    feature: 'Xem điểm số của sinh viên',
    keywords: ['điểm', 'điểm số', 'kết quả học tập', 'điểm trung bình'],
    guide:
      'Vào menu Điểm số, chọn sinh viên cần theo dõi để xem điểm từng môn, học kỳ, điểm trung bình và trạng thái công bố.',
  },
  {
    feature: 'Xem chuyên cần và điểm danh',
    keywords: ['điểm danh', 'chuyên cần', 'vắng', 'đi muộn', 'nghỉ học'],
    guide:
      'Vào menu Điểm danh để xem tổng quan chuyên cần và chi tiết theo từng lớp học phần, gồm số buổi có mặt, đi muộn và vắng.',
  },
  {
    feature: 'Xem lịch học',
    keywords: ['lịch học', 'thời khóa biểu', 'phòng học', 'giờ học', 'giảng viên'],
    guide:
      'Vào menu Lịch học để xem các lớp học phần của sinh viên, thời gian học, phòng học, giảng viên và các buổi học.',
  },
  {
    feature: 'Xem thông báo',
    keywords: ['thông báo', 'tin mới', 'nhắc nhở', 'lịch thi', 'học phí'],
    guide:
      'Vào menu Thông báo để xem thông tin mới từ nhà trường như lịch thi, học phí, sự kiện hoặc nhắc nhở quan trọng.',
  },
  {
    feature: 'Gửi phản hồi cho nhà trường',
    keywords: ['phản hồi', 'gửi câu hỏi', 'kiến nghị', 'liên hệ nhà trường', 'trao đổi'],
    guide:
      'Vào menu Phản hồi để gửi câu hỏi hoặc kiến nghị đến nhà trường, chọn nhóm nội dung phù hợp và theo dõi phản hồi trong luồng trao đổi.',
  },
  {
    feature: 'Xem câu hỏi thường gặp',
    keywords: ['faq', 'hỏi đáp', 'câu hỏi thường gặp', 'hướng dẫn'],
    guide:
      'Vào mục FAQ/Hỏi đáp để xem các câu hỏi thường gặp về học tập, tài chính, thời khóa biểu, kỷ luật và các vấn đề khác.',
  },
  {
    feature: 'Cập nhật hồ sơ cá nhân',
    keywords: ['hồ sơ', 'thông tin cá nhân', 'họ tên', 'email', 'số điện thoại'],
    guide:
      'Vào Cài đặt, chọn tab Hồ sơ cá nhân để xem số điện thoại và cập nhật họ tên, email liên lạc. Sau khi chỉnh, bấm Lưu thay đổi.',
  },
  {
    feature: 'Đổi ảnh đại diện',
    keywords: ['ảnh đại diện', 'avatar', 'đổi ảnh', 'cập nhật ảnh', 'hình đại diện'],
    guide:
      'Vào Cài đặt, chọn tab Hồ sơ cá nhân, bấm nút Đổi ảnh ở khu vực Ảnh đại diện, chọn file JPG/PNG/WebP/GIF dưới 5MB. Khi ảnh tải lên xong, bấm Lưu thay đổi để áp dụng.',
  },
  {
    feature: 'Đổi mật khẩu',
    keywords: ['mật khẩu', 'đổi mật khẩu', 'password', 'bảo mật'],
    guide:
      'Vào Cài đặt, chọn tab Đổi mật khẩu, nhập mật khẩu hiện tại và mật khẩu mới theo yêu cầu, sau đó bấm lưu/cập nhật để hoàn tất.',
  },
  {
    feature: 'Cài đặt thông báo',
    keywords: ['cài đặt thông báo', 'nhận thông báo', 'tắt thông báo', 'bật thông báo'],
    guide:
      'Vào Cài đặt, chọn tab Thông báo để bật/tắt các loại thông báo như điểm mới, cảnh báo vắng mặt, phản hồi từ nhà trường và thông báo chung.',
  },
  {
    feature: 'Dùng trợ lý AI',
    keywords: ['ai', 'trợ lý', 'chat', 'hỏi ai'],
    guide:
      'Có thể hỏi AI về điểm số, chuyên cần, lịch học, thông báo hoặc cách sử dụng các chức năng dành cho phụ huynh.',
  },
] as const;
