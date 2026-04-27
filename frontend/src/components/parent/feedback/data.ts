// Danh sách chủ đề cho form (sync với backend enum)
export const FEEDBACK_SUBJECTS = [
  { value: 'HOC_TAP', label: 'Học tập & Điểm số' },
  { value: 'TAI_CHINH', label: 'Tài chính & Học phí' },
  { value: 'THOI_KHOA_BIEU', label: 'Thời khóa biểu & Lịch học' },
  { value: 'KY_LUAT', label: 'Kỷ luật & Hành vi' },
  { value: 'KY_TUC_XA', label: 'Ký túc xá & Cơ sở vật chất' },
  { value: 'SUC_KHOE', label: 'Sức khỏe & Tâm lý học sinh' },
  { value: 'HOAT_DONG', label: 'Hoạt động ngoại khóa' },
  { value: 'KHAC', label: 'Khác' },
] as const;

export type FeedbackSubjectValue = typeof FEEDBACK_SUBJECTS[number]['value'];

export const CONTACT_INFO = {
  phone: '024 3754 7xxx',
  phoneNote: 'Thứ 2 - Thứ 6, 8:00 - 17:00',
  email: 'admin@uniconnect.edu.vn',
  office: 'Tòa nhà Hiệu bộ, Phòng 101',
};
