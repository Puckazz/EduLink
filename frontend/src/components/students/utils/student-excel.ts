import * as XLSX from 'xlsx';
import type { StudentTableStudent } from '@/components/students/StudentTable';

// ─── Export ──────────────────────────────────────────────────────────────────

function mapStudentsForExport(students: StudentTableStudent[]) {
  return students.map((s) => ({
    'MSSV': s.mssv,
    'Họ và Tên': s.name,
    'Email': s.email,
    'Chuyên ngành': s.major,
    'Năm học': s.year,
    'Khoá': s.cohort,
    'Phụ huynh': s.parentName,
    'Liên hệ PH': s.parentContact,
    'Trạng thái': s.status,
  }));
}

export function exportStudentsToExcel(
  students: StudentTableStudent[],
  fileName = 'danh-sach-sinh-vien.xlsx',
) {
  const worksheet = XLSX.utils.json_to_sheet(mapStudentsForExport(students));

  // Auto-size columns
  const colWidths = [
    { wch: 12 }, // MSSV
    { wch: 25 }, // Họ tên
    { wch: 28 }, // Email
    { wch: 22 }, // Chuyên ngành
    { wch: 10 }, // Năm học
    { wch: 12 }, // Khoá
    { wch: 22 }, // Phụ huynh
    { wch: 18 }, // Liên hệ PH
    { wch: 14 }, // Trạng thái
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sinh viên');
  XLSX.writeFile(workbook, fileName);
}

// ─── Import Template ──────────────────────────────────────────────────────────

export function exportStudentImportTemplate(
  fileName = 'template-import-sinh-vien.xlsx',
) {
  const sampleRows = [
    {
      'MSSV': '2023001',
      'Họ và Tên': 'Nguyễn Văn A',
      'Email': 'nva@example.com',
      'Chuyên ngành': 'Công nghệ thông tin',
      'Năm học': '3',
      'Khoá': 'K2023',
      'Ngày sinh': '2001-05-15',
      'Địa chỉ': '123 Lê Lợi, TP.HCM',
      'Trạng thái': 'Đang học',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 28 },
    { wch: 22 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 28 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, fileName);
}

// ─── Import / Parse ───────────────────────────────────────────────────────────

export interface ImportedStudentRow {
  mssv: string;
  full_name: string;
  email: string;
  major_name: string;
  year: string;
  cohort: string;
  date_of_birth?: string;
  address?: string;
}

interface ParseStudentImportResult {
  rows: ImportedStudentRow[];
  errors: string[];
}

const HEADER_MAP: Record<string, keyof ImportedStudentRow> = {
  mssv: 'mssv',
  'ho_va_ten': 'full_name',
  'ho_ten': 'full_name',
  'full_name': 'full_name',
  'ten': 'full_name',
  email: 'email',
  'chuyen_nganh': 'major_name',
  'major': 'major_name',
  'nam_hoc': 'year',
  'year': 'year',
  'khoa': 'cohort',
  'cohort': 'cohort',
  'ngay_sinh': 'date_of_birth',
  'date_of_birth': 'date_of_birth',
  'dia_chi': 'address',
  'address': 'address',
};

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

export async function parseStudentImportFile(
  file: File,
): Promise<ParseStudentImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return { rows: [], errors: ['File Excel không có sheet dữ liệu.'] };
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
  });

  if (rawRows.length === 0) {
    return { rows: [], errors: ['File Excel không có dòng dữ liệu.'] };
  }

  const rows: ImportedStudentRow[] = [];
  const errors: string[] = [];

  rawRows.forEach((originalRow, index) => {
    const rowNumber = index + 2;

    // Normalize keys
    const normalizedRow: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(originalRow)) {
      const normKey = normalizeHeader(key);
      const mappedKey = HEADER_MAP[normKey];
      if (mappedKey) {
        normalizedRow[mappedKey] = value;
      }
    }

    const mssv = String(normalizedRow['mssv'] ?? '').trim();
    const fullName = String(normalizedRow['full_name'] ?? '').trim();
    const email = String(normalizedRow['email'] ?? '').trim();

    if (!mssv) {
      errors.push(`Dòng ${rowNumber}: Thiếu MSSV.`);
      return;
    }
    if (!fullName) {
      errors.push(`Dòng ${rowNumber}: Thiếu họ tên sinh viên.`);
      return;
    }
    if (!email) {
      errors.push(`Dòng ${rowNumber}: Thiếu email.`);
      return;
    }

    rows.push({
      mssv,
      full_name: fullName,
      email,
      major_name: String(normalizedRow['major_name'] ?? '').trim(),
      year: String(normalizedRow['year'] ?? '').trim(),
      cohort: String(normalizedRow['cohort'] ?? '').trim(),
      date_of_birth: String(normalizedRow['date_of_birth'] ?? '').trim() || undefined,
      address: String(normalizedRow['address'] ?? '').trim() || undefined,
    });
  });

  return { rows, errors };
}
