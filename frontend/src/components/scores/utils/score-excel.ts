import * as XLSX from 'xlsx';
import type { ScorebookUiRow } from '@/types/score';

export interface ImportedScoreRow {
  student_code: string;
  assignment: number | null;
  midterm: number | null;
  final: number | null;
  note: string;
}

interface ParseScoreImportResult {
  rows: ImportedScoreRow[];
  errors: string[];
}

const IMPORT_HEADERS = {
  studentCode: ['student_code', 'mssv', 'ma_sinh_vien'],
  assignment: ['assignment', 'diem_thuong_xuyen'],
  midterm: ['midterm', 'diem_giua_ky'],
  final: ['final', 'diem_cuoi_ky'],
  note: ['note', 'ghi_chu'],
};

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function pickFieldValue<T extends Record<string, unknown>>(
  row: T,
  aliases: string[],
): unknown {
  for (const alias of aliases) {
    if (alias in row) {
      return row[alias];
    }
  }

  return undefined;
}

function parseScoreValue(raw: unknown, fieldLabel: string): number | null {
  if (raw === null || raw === undefined || raw === '') {
    return null;
  }

  const value = typeof raw === 'number' ? raw : Number(String(raw).trim());

  if (Number.isNaN(value)) {
    throw new Error(`${fieldLabel} không phải là số.`);
  }

  if (value < 0 || value > 10) {
    throw new Error(`${fieldLabel} phải nằm trong khoảng 0-10.`);
  }

  return Math.round(value * 100) / 100;
}

export async function parseScoreImportFile(
  file: File,
): Promise<ParseScoreImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return {
      rows: [],
      errors: ['File Excel không có sheet dữ liệu.'],
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
  });

  if (rawRows.length === 0) {
    return {
      rows: [],
      errors: ['File Excel không có dòng dữ liệu.'],
    };
  }

  const rows: ImportedScoreRow[] = [];
  const errors: string[] = [];

  rawRows.forEach((originalRow, index) => {
    const rowNumber = index + 2;
    const normalizedRow: Record<string, unknown> = {};

    Object.entries(originalRow).forEach(([key, value]) => {
      normalizedRow[normalizeHeader(key)] = value;
    });

    const studentCodeRaw = pickFieldValue(
      normalizedRow,
      IMPORT_HEADERS.studentCode,
    );
    const studentCode = String(studentCodeRaw ?? '').trim();

    if (!studentCode) {
      errors.push(`Dòng ${rowNumber}: Thiếu mã học sinh (MSSV).`);
      return;
    }

    try {
      rows.push({
        student_code: studentCode,
        assignment: parseScoreValue(
          pickFieldValue(normalizedRow, IMPORT_HEADERS.assignment),
          'Điểm thường xuyên',
        ),
        midterm: parseScoreValue(
          pickFieldValue(normalizedRow, IMPORT_HEADERS.midterm),
          'Điểm giữa kỳ',
        ),
        final: parseScoreValue(
          pickFieldValue(normalizedRow, IMPORT_HEADERS.final),
          'Điểm cuối kỳ',
        ),
        note: String(
          pickFieldValue(normalizedRow, IMPORT_HEADERS.note) ?? '',
        ).trim(),
      });
    } catch (error) {
      errors.push(
        `Dòng ${rowNumber}: ${error instanceof Error ? error.message : 'Dữ liệu không hợp lệ.'}`,
      );
    }
  });

  return { rows, errors };
}

function mapRowsForExport(rows: ScorebookUiRow[]) {
  const getLetterGrade = (avg: number | null): string => {
    if (avg === null) {
      return '--';
    }

    if (avg >= 9) {
      return 'A+';
    }

    if (avg >= 8.5) {
      return 'A';
    }

    if (avg >= 8) {
      return 'B+';
    }

    if (avg >= 7) {
      return 'B';
    }

    if (avg >= 6.5) {
      return 'C+';
    }

    if (avg >= 5.5) {
      return 'C';
    }

    if (avg >= 5) {
      return 'D+';
    }

    if (avg >= 4) {
      return 'D';
    }

    return 'F';
  };

  return rows.map((row) => ({
    'Mã học sinh': row.student_code,
    'Học sinh': row.student_name,
    Lớp: row.class_name,
    'Môn học': row.subject_name,
    'Điểm thường xuyên': row.assignment,
    'Điểm giữa kỳ': row.midterm,
    'Điểm cuối kỳ': row.final,
    'Điểm trung bình': row.avg,
    'Xếp loại': getLetterGrade(row.avg),
    'Trạng thái': row.publish_status,
    'Ghi chú': row.note,
    'Cập nhật lúc': row.updated_at ?? '',
  }));
}

export function exportScorebookToExcel(rows: ScorebookUiRow[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(mapRowsForExport(rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Scores');
  XLSX.writeFile(workbook, fileName);
}

export function exportScoreImportTemplate(fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet([
    {
      'Mã học sinh': '2023001',
      'Điểm thường xuyên': 8.5,
      'Điểm giữa kỳ': 7.5,
      'Điểm cuối kỳ': 9,
      'Ghi chú': 'Nhập theo thang 0-10',
    },
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, fileName);
}
