import * as XLSX from 'xlsx';
import type { StudentAttendance } from '@/components/attendance/detail/AttendanceDetailTableCard';

const STATUS_LABEL: Record<StudentAttendance['status'], string> = {
  present: 'Có mặt',
  late: 'Đi muộn',
  absent: 'Vắng mặt',
  none: 'Chưa điểm danh',
};

function mapAttendanceForExport(
  students: StudentAttendance[],
  sessionLabel: string,
) {
  return students.map((s, idx) => ({
    'STT': idx + 1,
    'MSSV': s.mssv,
    'Họ và Tên': s.name,
    'Buổi học': sessionLabel,
    'Trạng thái': STATUS_LABEL[s.status],
    'Ghi chú': s.note ?? '',
  }));
}

/** Export the attendance roster for a single session. */
export function exportAttendanceToExcel(
  students: StudentAttendance[],
  sessionLabel: string,
  fileName?: string,
) {
  const safeName = sessionLabel.replace(/[/\\:*?"<>|]/g, '-');
  const outputFileName = fileName ?? `diem-danh-${safeName}.xlsx`;

  const rows = mapAttendanceForExport(students, sessionLabel);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Column widths
  worksheet['!cols'] = [
    { wch: 5 },  // STT
    { wch: 12 }, // MSSV
    { wch: 26 }, // Họ tên
    { wch: 20 }, // Buổi học
    { wch: 16 }, // Trạng thái
    { wch: 30 }, // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Điểm danh');
  XLSX.writeFile(workbook, outputFileName);
}

/** Stats summary alongside the roster (two-sheet workbook). */
export function exportAttendanceWithSummary(
  students: StudentAttendance[],
  sessionLabel: string,
  fileName?: string,
) {
  const safeName = sessionLabel.replace(/[/\\:*?"<>|]/g, '-');
  const outputFileName = fileName ?? `bao-cao-diem-danh-${safeName}.xlsx`;

  // Sheet 1: roster
  const rosterRows = mapAttendanceForExport(students, sessionLabel);
  const rosterSheet = XLSX.utils.json_to_sheet(rosterRows);
  rosterSheet['!cols'] = [
    { wch: 5 }, { wch: 12 }, { wch: 26 }, { wch: 20 }, { wch: 16 }, { wch: 30 },
  ];

  // Sheet 2: summary
  const presentCount = students.filter((s) => s.status === 'present').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const total = students.length;

  const summaryRows = [
    { 'Chỉ số': 'Tổng sinh viên', 'Số lượng': total, 'Tỉ lệ (%)': '100%' },
    {
      'Chỉ số': 'Có mặt',
      'Số lượng': presentCount,
      'Tỉ lệ (%)': total > 0 ? `${((presentCount / total) * 100).toFixed(1)}%` : '0%',
    },
    {
      'Chỉ số': 'Đi muộn',
      'Số lượng': lateCount,
      'Tỉ lệ (%)': total > 0 ? `${((lateCount / total) * 100).toFixed(1)}%` : '0%',
    },
    {
      'Chỉ số': 'Vắng mặt',
      'Số lượng': absentCount,
      'Tỉ lệ (%)': total > 0 ? `${((absentCount / total) * 100).toFixed(1)}%` : '0%',
    },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 14 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, rosterSheet, 'Danh sách');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng kết');
  XLSX.writeFile(workbook, outputFileName);
}
