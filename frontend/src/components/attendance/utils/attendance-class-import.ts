'use client';

import * as XLSX from 'xlsx';


export interface ImportedClassRow {
  class_code: string;
  subject_code: string;
  teacher_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  semester: string;
  student_codes: string[];
}

export interface ParseClassImportResult {
  rows: ImportedClassRow[];
  errors: string[];
}


export function downloadClassImportTemplate(
  fileName = 'template-import-lop-hoc.xlsx',
) {
  const sampleRows = [
    {
      'Mã lớp': 'L01',
      'Mã môn học': 'INT101',
      'Tên giảng viên': 'PGS.TS. Nguyễn Văn A',
      'Thứ': 'Thứ 2',
      'Giờ bắt đầu': '7:30',
      'Giờ kết thúc': '9:30',
      'Phòng': 'A1.202',
      'Học kỳ': 'HK1-2024',
      'Danh sách MSSV (cách nhau bởi dấu phẩy)': 'SV2024001,SV2024002,SV2024003',
    },
    {
      'Mã lớp': 'L02',
      'Mã môn học': 'MAT101',
      'Tên giảng viên': 'ThS. Trần Thị B',
      'Thứ': 'Thứ 4',
      'Giờ bắt đầu': '13:30',
      'Giờ kết thúc': '15:30',
      'Phòng': 'C2.501',
      'Học kỳ': 'HK1-2024',
      'Danh sách MSSV (cách nhau bởi dấu phẩy)': 'SV2024004,SV2024005',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 14 },
    { wch: 28 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 40 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, fileName);
}


function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '');
}

const HEADER_MAP: Record<string, keyof ImportedClassRow | 'student_codes_raw'> = {
  'ma_lop':            'class_code',
  'class_code':        'class_code',
  'ma_mon_hoc':        'subject_code',
  'subject_code':      'subject_code',
  'ten_giang_vien':    'teacher_name',
  'teacher_name':      'teacher_name',
  'thu':               'day_of_week',
  'day_of_week':       'day_of_week',
  'gio_bat_dau':       'start_time',
  'start_time':        'start_time',
  'gio_ket_thuc':      'end_time',
  'end_time':          'end_time',
  'phong':             'room',
  'room':              'room',
  'hoc_ky':            'semester',
  'semester':          'semester',
  'danh_sach_mssv_cach_nhau_boi_dau_phay': 'student_codes_raw',
  'danh_sach_mssv':    'student_codes_raw',
  'student_codes':     'student_codes_raw',
  'mssv':              'student_codes_raw',
};


export async function parseClassImportFile(file: File): Promise<ParseClassImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return { rows: [], errors: ['File Excel không có sheet dữ liệu.'] };
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  if (rawRows.length === 0) {
    return { rows: [], errors: ['File Excel không có dòng dữ liệu.'] };
  }

  const rows: ImportedClassRow[] = [];
  const errors: string[] = [];

  rawRows.forEach((originalRow, index) => {
    const rowNumber = index + 2;

    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(originalRow)) {
      const normKey = normalizeHeader(key);
      const mappedKey = HEADER_MAP[normKey];
      if (mappedKey) normalized[mappedKey] = value;
    }

    const classCode = String(normalized['class_code'] ?? '').trim();
    const subjectCode = String(normalized['subject_code'] ?? '').trim();
    const teacherName = String(normalized['teacher_name'] ?? '').trim();
    const room = String(normalized['room'] ?? '').trim();
    const semester = String(normalized['semester'] ?? '').trim();

    if (!classCode) { errors.push(`Dòng ${rowNumber}: Thiếu Mã lớp.`); return; }
    if (!subjectCode) { errors.push(`Dòng ${rowNumber}: Thiếu Mã môn học.`); return; }
    if (!teacherName) { errors.push(`Dòng ${rowNumber}: Thiếu Tên giảng viên.`); return; }
    if (!semester) { errors.push(`Dòng ${rowNumber}: Thiếu Học kỳ.`); return; }

    const rawCodes = String(normalized['student_codes_raw'] ?? '').trim();
    const studentCodes = rawCodes
      ? rawCodes.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    rows.push({
      class_code: classCode,
      subject_code: subjectCode,
      teacher_name: teacherName,
      day_of_week: String(normalized['day_of_week'] ?? '').trim(),
      start_time: String(normalized['start_time'] ?? '').trim(),
      end_time: String(normalized['end_time'] ?? '').trim(),
      room,
      semester,
      student_codes: studentCodes,
    });
  });

  return { rows, errors };
}
