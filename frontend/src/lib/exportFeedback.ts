import * as XLSX from 'xlsx';
import { FeedbackService } from '@/services/feedback.service';
import {
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackAnalytics,
  type FeedbackCategory,
} from '@/types/feedback';

interface ExportFilters {
  status?: string;
  category?: string;
  search?: string;
}

const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function autoSizeColumns<T extends Record<string, unknown>>(ws: XLSX.WorkSheet, rows: T[]) {
  if (rows.length === 0) return;

  ws['!cols'] = Object.keys(rows[0]).map((key) => ({
    wch:
      Math.max(
        key.length,
        ...rows.map((row) => String(row[key] ?? '').length),
      ) + 2,
  }));
}

async function saveWorkbook(wb: XLSX.WorkBook, fileName: string) {
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    let fileHandle: FileSystemFileHandle;
    try {
      fileHandle = await (window as Window & typeof globalThis & {
        showSaveFilePicker: (opts: object) => Promise<FileSystemFileHandle>;
      }).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'Excel Workbook',
            accept: {
              [XLSX_MIME_TYPE]: ['.xlsx'],
            },
          },
        ],
      });
    } catch {
      return;
    }

    const workbookData = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([workbookData], { type: XLSX_MIME_TYPE });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  } else {
    XLSX.writeFile(wb, fileName);
  }
}

function buildWorkbook(feedbacks: Awaited<ReturnType<typeof FeedbackService.getExportData>>) {
  const rows = feedbacks.map((fb) => ({
    'ID': fb.feedback_id,
    'Tiêu đề': fb.title,
    'Danh mục': FEEDBACK_CATEGORY_LABELS[fb.category as FeedbackCategory] ?? fb.category,
    'Trạng thái':
      fb.status === 'OPEN' ? 'Chờ xử lý'
      : fb.status === 'IN_PROGRESS' ? 'Đang xử lý'
      : 'Đã giải quyết',
    'Phụ huynh': fb.parent?.full_name ?? '',
    'SĐT': fb.parent?.phone ?? '',
    'Email': fb.parent?.email ?? '',
    'Học sinh': fb.student?.full_name ?? '',
    'MSSV': fb.student?.student_code ?? '',
    'Số tin nhắn': fb.messages?.length ?? 0,
    'Ngày tạo': new Date(fb.created_at).toLocaleDateString('vi-VN'),
    'Cập nhật lần cuối': new Date(fb.updated_at).toLocaleDateString('vi-VN'),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  autoSizeColumns(ws, rows);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Phản hồi');
  return wb;
}

function buildAnalyticsWorkbook(analytics: FeedbackAnalytics) {
  const summaryRows = [
    { 'Chỉ số': 'Tổng phản hồi (6 tháng)', 'Giá trị': analytics.totalInPeriod },
    { 'Chỉ số': 'Đã được phản hồi', 'Giá trị': analytics.respondedCount },
    { 'Chỉ số': 'Tỷ lệ giải quyết', 'Giá trị': `${analytics.resolutionRate}%` },
    {
      'Chỉ số': 'Thời gian phản hồi trung bình',
      'Giá trị':
        analytics.avgResponseHours === null
          ? '—'
          : analytics.avgResponseHours < 1
            ? `${Math.round(analytics.avgResponseHours * 60)} phút`
            : `${analytics.avgResponseHours} giờ`,
    },
  ];

  const trendRows = analytics.trend.map((item) => ({
    'Tháng': item.month,
    'Tổng phản hồi': item.total,
    'Đã giải quyết': item.resolved,
    'Chưa giải quyết': Math.max(item.total - item.resolved, 0),
  }));

  const categoryRows = analytics.categoryBreakdown.map((item) => ({
    'Danh mục':
      FEEDBACK_CATEGORY_LABELS[item.category as FeedbackCategory] ??
      item.category,
    'Số lượng': item.count,
    'Tỷ trọng':
      analytics.totalInPeriod > 0
        ? `${Math.round((item.count / analytics.totalInPeriod) * 100)}%`
        : '0%',
  }));

  const wb = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  autoSizeColumns(summarySheet, summaryRows);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Tổng quan');

  const trendSheet = XLSX.utils.json_to_sheet(trendRows);
  autoSizeColumns(trendSheet, trendRows);
  XLSX.utils.book_append_sheet(wb, trendSheet, 'Xu hướng');

  const categorySheet = XLSX.utils.json_to_sheet(categoryRows);
  autoSizeColumns(categorySheet, categoryRows);
  XLSX.utils.book_append_sheet(wb, categorySheet, 'Danh mục');

  return wb;
}

export async function exportFeedbackToExcel(filters: ExportFilters = {}): Promise<void> {
  const data = await FeedbackService.getExportData(filters);

  if (data.length === 0) return;

  const wb = buildWorkbook(data);
  const fileName = `phan-hoi-${new Date().toISOString().slice(0, 10)}.xlsx`;

  await saveWorkbook(wb, fileName);
}

export async function exportFeedbackAnalyticsToExcel(
  analytics: FeedbackAnalytics,
): Promise<void> {
  const wb = buildAnalyticsWorkbook(analytics);
  const fileName = `thong-ke-phan-hoi-${new Date().toISOString().slice(0, 10)}.xlsx`;

  await saveWorkbook(wb, fileName);
}
