import * as XLSX from 'xlsx';
import type { AttendanceSession, SessionRecord } from '@/types/attendance';

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

interface StudentAttendanceExportInput {
  session: AttendanceSession;
  records: SessionRecord[];
}

export function exportAttendanceByStudent(
  sessionsWithRecords: StudentAttendanceExportInput[],
  classLabel: string,
  fileName?: string,
) {
  const safeName = classLabel.replace(/[/\\:*?"<>|]/g, '-');
  const outputFileName = fileName ?? `diem-danh-theo-sinh-vien-${safeName}.xlsx`;
  const sortedSessions = [...sessionsWithRecords].sort(
    (a, b) => a.session.session_no - b.session.session_no,
  );

  const students = new Map<
    number,
    {
      studentCode: string;
      fullName: string;
      statuses: Record<number, string>;
      present: number;
      late: number;
      absent: number;
      none: number;
    }
  >();

  sortedSessions.forEach(({ session, records }) => {
    records.forEach((record) => {
      const student = record.enrollment.student;
      const current = students.get(student.student_id) ?? {
        studentCode: student.student_code,
        fullName: student.full_name,
        statuses: {},
        present: 0,
        late: 0,
        absent: 0,
        none: 0,
      };

      current.statuses[session.session_id] = STATUS_LABEL[record.status] ?? record.status;
      if (record.status === 'PRESENT') current.present += 1;
      else if (record.status === 'LATE') current.late += 1;
      else if (record.status === 'ABSENT') current.absent += 1;
      else current.none += 1;

      students.set(student.student_id, current);
    });
  });

  const totalSessions = sortedSessions.length;
  const rows = Array.from(students.values())
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
    .map((student, idx) => {
      const row: Record<string, string | number> = {
        STT: idx + 1,
        MSSV: student.studentCode,
        'Họ và Tên': student.fullName,
      };

      sortedSessions.forEach(({ session }) => {
        const date = new Date(session.session_date).toLocaleDateString('vi-VN');
        row[`Buổi ${session.session_no} (${date})`] =
          student.statuses[session.session_id] ?? STATUS_LABEL.NONE;
      });

      row['Có mặt'] = student.present;
      row['Đi muộn'] = student.late;
      row['Vắng mặt'] = student.absent;
      row['Chưa điểm danh'] = student.none;
      row['Tỉ lệ tham gia (%)'] =
        totalSessions > 0
          ? Number((((student.present + student.late) / totalSessions) * 100).toFixed(1))
          : 0;

      return row;
    });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 26 },
    ...sortedSessions.map(() => ({ wch: 18 })),
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 15 },
    { wch: 16 },
  ];

  const legendRows = [
    { 'Ký hiệu': 'Có mặt', 'Ý nghĩa': 'Sinh viên có mặt trong buổi học' },
    { 'Ký hiệu': 'Đi muộn', 'Ý nghĩa': 'Sinh viên đi muộn trong buổi học' },
    { 'Ký hiệu': 'Vắng mặt', 'Ý nghĩa': 'Sinh viên vắng mặt trong buổi học' },
    { 'Ký hiệu': 'Chưa điểm danh', 'Ý nghĩa': 'Buổi học chưa có dữ liệu điểm danh của sinh viên' },
  ];
  const legendSheet = XLSX.utils.json_to_sheet(legendRows);
  legendSheet['!cols'] = [{ wch: 16 }, { wch: 56 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Theo sinh viên');
  XLSX.utils.book_append_sheet(workbook, legendSheet, 'Chú thích');
  XLSX.writeFile(workbook, outputFileName);
}
