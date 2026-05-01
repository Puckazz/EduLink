import * as XLSX from 'xlsx';
import type { SessionRecord } from '@/services/attendance.service';

const STATUS_LABEL: Record<string, string> = {
  PRESENT: 'Có mặt',
  LATE: 'Đi muộn',
  ABSENT: 'Vắng mặt',
  NONE: 'Chưa điểm danh',
};

function mapForExport(records: SessionRecord[], sessionLabel: string) {
  return records.map((r, idx) => ({
    'STT': idx + 1,
    'MSSV': r.enrollment.student.student_code,
    'Họ và Tên': r.enrollment.student.full_name,
    'Buổi học': sessionLabel,
    'Trạng thái': STATUS_LABEL[r.status] ?? r.status,
    'Ghi chú': r.note ?? '',
  }));
}

/** Export the attendance roster for a single session. */
export function exportAttendanceToExcel(
  records: SessionRecord[],
  sessionLabel: string,
  fileName?: string,
) {
  const safeName = sessionLabel.replace(/[/\\:*?"<>|]/g, '-');
  const outputFileName = fileName ?? `diem-danh-${safeName}.xlsx`;

  const rows = mapForExport(records, sessionLabel);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 5 }, { wch: 12 }, { wch: 26 }, { wch: 20 }, { wch: 16 }, { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Điểm danh');
  XLSX.writeFile(workbook, outputFileName);
}

/** Stats summary alongside the roster (two-sheet workbook). */
export function exportAttendanceWithSummary(
  records: SessionRecord[],
  sessionLabel: string,
  fileName?: string,
) {
  const safeName = sessionLabel.replace(/[/\\:*?"<>|]/g, '-');
  const outputFileName = fileName ?? `bao-cao-diem-danh-${safeName}.xlsx`;

  const rosterRows = mapForExport(records, sessionLabel);
  const rosterSheet = XLSX.utils.json_to_sheet(rosterRows);
  rosterSheet['!cols'] = [
    { wch: 5 }, { wch: 12 }, { wch: 26 }, { wch: 20 }, { wch: 16 }, { wch: 30 },
  ];

  const total = records.length;
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const lateCount    = records.filter((r) => r.status === 'LATE').length;
  const absentCount  = records.filter((r) => r.status === 'ABSENT').length;

  const summaryRows = [
    { 'Chỉ số': 'Tổng sinh viên', 'Số lượng': total, 'Tỉ lệ (%)': '100%' },
    { 'Chỉ số': 'Có mặt',   'Số lượng': presentCount, 'Tỉ lệ (%)': total > 0 ? `${((presentCount / total) * 100).toFixed(1)}%` : '0%' },
    { 'Chỉ số': 'Đi muộn',  'Số lượng': lateCount,    'Tỉ lệ (%)': total > 0 ? `${((lateCount    / total) * 100).toFixed(1)}%` : '0%' },
    { 'Chỉ số': 'Vắng mặt', 'Số lượng': absentCount,  'Tỉ lệ (%)': total > 0 ? `${((absentCount  / total) * 100).toFixed(1)}%` : '0%' },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 14 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, rosterSheet, 'Danh sách');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng kết');
  XLSX.writeFile(workbook, outputFileName);
}
