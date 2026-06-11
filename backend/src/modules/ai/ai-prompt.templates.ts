import type { FeedbackStatus } from '@prisma/client';
import type { FeedbackService } from '../feedback/feedback.service';
import type { StudentContext } from './ai-context.builder';
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUS_LABELS,
  PARENT_USAGE_INTENT_KEYWORDS,
  PARENT_USAGE_GUIDE,
} from './ai-prompt.config';

type NotificationRecipient = 'all' | 'parents' | 'teachers';

interface NotificationDraftPromptInput {
  brief: string;
  recipient: NotificationRecipient;
  isUrgent?: boolean;
}

interface FeedbackSummaryPromptInput {
  feedbacks: Array<{
    feedback_id: number;
    title: string;
    category: string;
    status: string;
    content: string;
    parent?: { full_name: string } | null;
    student?: {
      full_name: string;
      student_code: string;
      class: string | null;
    } | null;
    messages: Array<{ content: string; sender_role: string }>;
  }>;
  stats: Awaited<ReturnType<FeedbackService['getStats']>>;
  analytics: Awaited<ReturnType<FeedbackService['getAnalytics']>>;
}

interface FeedbackReplyPromptInput {
  title: string;
  category: string;
  status: FeedbackStatus | string;
  content: string;
  parent?: { full_name: string } | null;
  student?: {
    full_name: string;
    student_code: string;
    class: string | null;
  } | null;
  messages: Array<{ content: string; sender_role: string }>;
}

function getRecipientLabel(recipient: NotificationRecipient) {
  if (recipient === 'parents') return 'Phụ huynh';
  if (recipient === 'teachers') return 'Giáo viên';
  return 'Tất cả người dùng';
}

function escapePromptText(value: string) {
  return value.replace(/[`$]/g, '').trim();
}

function truncate(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 3)}...`;
}

function formatStudentLabel(
  student?: {
    full_name: string;
    student_code: string;
    class: string | null;
  } | null,
) {
  if (!student) return null;
  return `${student.full_name} (${student.student_code}${student.class ? `, lớp ${student.class}` : ''})`;
}

function normalizeVietnamese(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function shouldIncludeParentUsageGuide(message: string) {
  const normalizedMessage = normalizeVietnamese(message);

  return PARENT_USAGE_INTENT_KEYWORDS.some((keyword) =>
    normalizedMessage.includes(normalizeVietnamese(keyword)),
  );
}

export function buildNotificationDraftPrompt(input: NotificationDraftPromptInput) {
  const recipientLabel = getRecipientLabel(input.recipient);

  return `Bạn là trợ lý hành chính của hệ thống quản lý giáo dục EduLink.
Nhiệm vụ: viết nháp thông báo tiếng Việt trang trọng, rõ ràng, ngắn gọn để admin xem lại trước khi gửi.

Ràng buộc:
- Chỉ dựa trên ý chính được cung cấp, không tự bịa ngày/địa điểm/quy định.
- Nếu thiếu chi tiết, viết trung tính và để admin có thể chỉnh sửa.
- Trả về JSON hợp lệ, không markdown, không giải thích.
- Schema: {"title":"string","content":"string"}
- Tiêu đề tối đa 120 ký tự. Nội dung tối đa 500 ký tự.

Đối tượng nhận: ${recipientLabel}
Mức độ khẩn cấp: ${input.isUrgent ? 'Quan trọng/khẩn cấp' : 'Thông thường'}
Ý chính: ${escapePromptText(input.brief)}`;
}

export function buildFeedbackSummaryPrompt(input: FeedbackSummaryPromptInput) {
  return `Bạn là trợ lý vận hành trường học. Hãy tóm tắt các phản hồi phụ huynh đang cần xử lý cho admin.

Ràng buộc:
- Chỉ dùng dữ liệu trong danh sách, không suy đoán ngoài dữ liệu.
- Ưu tiên phát hiện phản hồi khẩn cấp dựa trên nội dung như sức khỏe, kỷ luật, tài chính gấp, lịch học/thi sát hạn, phụ huynh không hài lòng mạnh.
- Trả về JSON hợp lệ, không markdown, không giải thích.
- Schema: {"summary":"string","urgentCount":number,"suggestedActions":["string"]}
- summary tối đa 180 ký tự; suggestedActions tối đa 3 mục, mỗi mục tối đa 80 ký tự.
- Không liệt kê chi tiết từng ID nếu không cần.

Số liệu hệ thống:
${JSON.stringify({
  statusCounts: input.stats,
  sixMonthAnalytics: {
    totalInPeriod: input.analytics.totalInPeriod,
    respondedCount: input.analytics.respondedCount,
    avgResponseHours: input.analytics.avgResponseHours,
    resolutionRate: input.analytics.resolutionRate,
    topCategories: input.analytics.categoryBreakdown.slice(0, 5),
  },
})}

Danh sách phản hồi:
${JSON.stringify(
  input.feedbacks.map((feedback) => ({
    id: feedback.feedback_id,
    title: feedback.title,
    category: FEEDBACK_CATEGORY_LABELS[feedback.category] ?? feedback.category,
    status: FEEDBACK_STATUS_LABELS[feedback.status] ?? feedback.status,
    parent: feedback.parent?.full_name,
    student: formatStudentLabel(feedback.student),
    content: truncate(feedback.content, 180),
    latestMessages: feedback.messages
      .slice()
      .reverse()
      .map((message) => ({
        role: message.sender_role,
        content: truncate(message.content, 120),
      })),
  })),
  null,
  2,
)}`;
}

export function buildFeedbackReplyPrompt(feedback: FeedbackReplyPromptInput) {
  return `Bạn là admin trường học đang trả lời phụ huynh trong hệ thống EduLink.

Ràng buộc:
- Viết tiếng Việt lịch sự, đồng cảm, chuyên nghiệp.
- Không hứa chắc kết quả nếu dữ liệu chưa có; dùng câu như "Nhà trường sẽ kiểm tra" khi cần.
- Không tự bịa thông tin về lịch, học phí, điểm số, quy định.
- Trả về JSON hợp lệ, không markdown, không giải thích.
- Schema: {"content":"string"}
- content tối đa 700 ký tự.

Ngữ cảnh phản hồi:
${JSON.stringify(
  {
    title: feedback.title,
    category: FEEDBACK_CATEGORY_LABELS[feedback.category] ?? feedback.category,
    status: FEEDBACK_STATUS_LABELS[feedback.status] ?? feedback.status,
    parent: feedback.parent?.full_name,
    student: formatStudentLabel(feedback.student),
    originalContent: feedback.content,
    thread: feedback.messages.map((message) => ({
      role: message.sender_role,
      content: message.content,
    })),
  },
  null,
  2,
)}`;
}

export function buildConversationTitlePrompt(message: string) {
  return `Tóm tắt câu hỏi sau thành một tiêu đề tiếng Việt từ 4 đến 7 từ. Chỉ trả lời bằng tiêu đề thuần túy, không thêm bất kỳ nội dung nào khác, không xuống dòng, không dấu ngoặc kép.\n\nCâu hỏi: "${message}"\nTiêu đề:`;
}

export function buildParentChatPrompt(
  context: StudentContext,
  conversationHistory: string,
  message: string,
) {
  const usageGuideSection = shouldIncludeParentUsageGuide(message)
    ? `Hướng dẫn sử dụng EduLink cho phụ huynh:
${JSON.stringify(PARENT_USAGE_GUIDE, null, 2)}
`
    : '';
  const usageGuideRules = usageGuideSection
    ? `- Nếu có phần "Hướng dẫn sử dụng EduLink cho phụ huynh", đó là câu hỏi hướng dẫn thao tác hệ thống và hãy ưu tiên phần này.
- Khi hướng dẫn thao tác, hãy nêu đúng menu/tab/nút liên quan nếu có trong guide.
`
    : '';

  return `Bạn là trợ lý AI của hệ thống quản lý giáo dục EduLink, hỗ trợ phụ huynh theo dõi tình hình học tập của con.

Ràng buộc:
- Trả lời bằng tiếng Việt, thân thiện, rõ ràng.
- Chỉ dùng dữ liệu được cung cấp bên dưới, không bịa thêm.
${usageGuideRules.trimEnd()}
- Nếu câu hỏi cần dữ liệu cá nhân nhưng không có dữ liệu phù hợp, nói rõ "Hiện tại chưa có dữ liệu về vấn đề này".
- Dùng emoji phù hợp để làm nổi bật thông tin (✅ ⚠️ 🌟 📈 📉).
- Trả lời ngắn gọn, tối đa 800 ký tự.
- Không dùng markdown heading (#), chỉ dùng text thuần với gạch đầu dòng nếu cần.

Thông tin sinh viên:
- Họ tên: ${context.studentName} (MSSV: ${context.studentCode})
- Lớp: ${context.className ?? 'Chưa có'}
- Ngành: ${context.majorName ?? 'Chưa có'}

${usageGuideSection}
Điểm số:
${JSON.stringify(context.scores, null, 2)}

Chuyên cần:
${JSON.stringify(context.attendances, null, 2)}

Lịch học:
${JSON.stringify(context.schedule, null, 2)}

Thông báo gần đây:
${JSON.stringify(context.recentNotifications, null, 2)}

${conversationHistory ? `Lịch sử hội thoại:\n${conversationHistory}\n` : ''}
Phụ huynh: ${message}
Trợ lý:`;
}
