export type FeedbackStatus = 'unread' | 'replied';

export interface Feedback {
  id: string;
  senderName: string;
  senderEmail: string;
  studentInfo: string;
  subject: string;
  preview: string;
  fullContent: string;
  time: string;
  fullDate: string;
  status: FeedbackStatus;
  avatarChar: string;
  previousInteraction?: {
    adminName: string;
    time: string;
    content: string;
  };
}

export const MOCK_FEEDBACKS: Feedback[] = [
  {
    id: '1',
    senderName: 'Trần Văn Mạnh',
    senderEmail: 'manh.tran@example.com',
    studentInfo: 'Trần Thị Mai (MSSV: 8821)',
    subject: 'V/v: Lịch học phụ đạo Toán',
    preview: 'Chào nhà trường, tôi muốn hỏi về việc liệu trường có tổ chức lớp phụ đạo môn Giải tích 1 không. Cháu Mai đang gặp khó khăn...',
    fullContent: `Kính gửi Ban Giám hiệu và Phòng Đào tạo,\n\nTôi hy vọng thầy cô vẫn khỏe.\nTôi muốn hỏi liệu nhà trường có cung cấp thêm hỗ trợ học tập cho môn Giải tích 1 không. Cháu Mai gần đây gặp khó khăn với phần đạo hàm, và mặc dù cháu tham gia đầy đủ các buổi giảng, cháu cảm thấy cần thêm sự hướng dẫn cá nhân.\nCó chương trình gia sư nào từ các anh chị khóa trên hoặc giờ tiếp sinh viên cụ thể nào dành cho sinh viên năm nhất mà cháu có thể đăng ký không? Gia đình muốn đảm bảo cháu nhận được sự giúp đỡ cần thiết trước kỳ thi giữa kỳ.\n\nCảm ơn sự hỗ trợ của thầy cô.\n\nTrân trọng,\nTrần Văn Mạnh`,
    time: '10:23 Sáng',
    fullDate: '25 Th10, 2023, 10:23 Sáng',
    status: 'unread',
    avatarChar: 'TM',
    previousInteraction: {
      adminName: 'Admin (Alex Morgan)',
      time: '24 Th10, 2023',
      content: 'Chào anh Mạnh, cảm ơn anh đã liên hệ. Tôi đã chuyển yêu cầu của anh...'
    }
  },
  {
    id: '2',
    senderName: 'Nguyễn Thị Lan',
    senderEmail: 'lan.nguyen@example.com',
    studentInfo: 'Lê Văn Hùng (MSSV: 9932)',
    subject: 'Hỏi về phí tham quan thực tế sắp tới',
    preview: 'Xin chào, tôi muốn hỏi hạn chót đóng phí cho chuyến đi thực tế địa chất là khi nào? Tôi không tìm thấy thông tin trong...',
    fullContent: `Chào phòng Đào tạo,\nTôi là phụ huynh cháu Hùng. Xin cho tôi hỏi thông tin về chuyến đi thực tế. Xin cảm ơn.`,
    time: 'Hôm qua',
    fullDate: '24 Th10, 2023, 15:00 Chiều',
    status: 'replied',
    avatarChar: 'NL',
  },
  {
    id: '3',
    senderName: 'Phạm Đức Trung',
    senderEmail: 'trung.pham@example.com',
    studentInfo: 'Phạm Minh Tuấn (MSSV: 1022)',
    subject: 'Truy cập tài nguyên thư viện trực tuyến',
    preview: 'Cháu Tuấn gặp khó khăn khi đăng nhập vào cơ sở dữ liệu JSTOR từ nhà. Có cần sử dụng VPN cụ thể nào không?',
    fullContent: `Kính gửi trung tâm thư viện,\nCháu Tuấn không log in được vào hệ thống. Mong thầy cô hỗ trợ.`,
    time: '24 Th10',
    fullDate: '24 Th10, 2023, 09:12 Sáng',
    status: 'replied',
    avatarChar: 'PT',
  },
  {
    id: '4',
    senderName: 'Hoàng Thu Thủy',
    senderEmail: 'thuy.hoang@example.com',
    studentInfo: 'Nguyễn Thùy Linh (MSSV: 4451)',
    subject: 'Tình trạng đơn xin học bổng',
    preview: 'Chào thầy cô, gia đình đã nộp đơn tuần trước nhưng chưa nhận được email xác nhận.',
    fullContent: `Kính gửi phòng công tác sinh viên...`,
    time: '22 Th10',
    fullDate: '22 Th10, 2023, 14:30 Chiều',
    status: 'unread',
    avatarChar: 'HT',
  },
  {
    id: '5',
    senderName: 'Lê Văn Sơn',
    senderEmail: 'son.le@example.com',
    studentInfo: 'Lê Thanh Tùng (MSSV: 2121)',
    subject: 'Vấn đề Ký túc xá - Phòng 304',
    preview: 'Có vẻ như hệ thống sưởi trong phòng cháu Tùng gặp sự cố. Nhờ bộ phận bảo trì kiểm tra giúp.',
    fullContent: `Kính gửi ban quản lý KTX...`,
    time: '20 Th10',
    fullDate: '20 Th10, 2023, 08:00 Sáng',
    status: 'replied',
    avatarChar: 'LS',
  }
];
