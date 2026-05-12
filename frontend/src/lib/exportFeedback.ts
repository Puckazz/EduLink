import * as XLSX from 'xlsx';
import { FeedbackService } from '@/services/feedback.service';
import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from '@/types/feedback';

interface ExportFilters {
  status?: string;
  category?: string;
  search?: string;
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
  if (rows.length > 0) {
    ws['!cols'] = Object.keys(rows[0]).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key as keyof typeof r] ?? '').length)) + 2,
    }));
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Phản hồi');
  return wb;
}

export async function exportFeedbackToExcel(filters: ExportFilters = {}): Promise<void> {
  const data = await FeedbackService.getExportData(filters);

  if (data.length === 0) return;

  const wb = buildWorkbook(data);
  const fileName = `phan-hoi-${new Date().toISOString().slice(0, 10)}.xlsx`;

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
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            },
          },
        ],
      });
    } catch {
      return;
    }

    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
    const writable = await fileHandle.createWritable();
    await writable.write(buffer.buffer as ArrayBuffer);
    await writable.close();
  } else {
    XLSX.writeFile(wb, fileName);
  }
}
