import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';

export interface ImportClassRow {
  class_code: string;
  subject_code: string;
  teacher_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  semester: string;
  student_codes: string[]; // split from comma-separated
}

export interface ImportClassResult {
  created: number;
  skipped: number;
  enrolled: number;
  errors: string[];
}

@Injectable()
export class ImportClassSectionService {
  constructor(private readonly prisma: PrismaService) {}

  async importFromBuffer(buffer: Buffer): Promise<ImportClassResult> {
    // 1) Parse Excel
    let rows: ImportClassRow[];
    try {
      rows = this.parseExcel(buffer);
    } catch {
      throw new BadRequestException('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.');
    }

    if (rows.length === 0) {
      throw new BadRequestException('File Excel không có dòng dữ liệu hợp lệ.');
    }

    const result: ImportClassResult = { created: 0, skipped: 0, enrolled: 0, errors: [] };

    for (const row of rows) {
      try {
        await this.processRow(row, result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Lớp "${row.class_code}": ${msg}`);
      }
    }

    return result;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private parseExcel(buffer: Buffer): ImportClassRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

    return rawRows
      .map((row, index) => this.normalizeRow(row, index + 2))
      .filter((r): r is ImportClassRow => r !== null);
  }

  private normalizeHeader(s: string): string {
    return s
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[()]/g, '');
  }

  private normalizeRow(
    raw: Record<string, unknown>,
    rowNum: number,
  ): ImportClassRow | null {
    const HEADER_MAP: Record<string, string> = {
      ma_lop: 'class_code',
      class_code: 'class_code',
      ma_mon_hoc: 'subject_code',
      subject_code: 'subject_code',
      ten_giang_vien: 'teacher_name',
      teacher_name: 'teacher_name',
      thu: 'day_of_week',
      day_of_week: 'day_of_week',
      gio_bat_dau: 'start_time',
      start_time: 'start_time',
      gio_ket_thuc: 'end_time',
      end_time: 'end_time',
      phong: 'room',
      room: 'room',
      hoc_ky: 'semester',
      semester: 'semester',
      danh_sach_mssv_cach_nhau_boi_dau_phay: 'student_codes_raw',
      danh_sach_mssv: 'student_codes_raw',
      student_codes: 'student_codes_raw',
      mssv: 'student_codes_raw',
    };

    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) {
      const normKey = this.normalizeHeader(key);
      const mapped = HEADER_MAP[normKey];
      if (mapped) normalized[mapped] = value;
    }

    const classCode = String(normalized['class_code'] ?? '').trim();
    const subjectCode = String(normalized['subject_code'] ?? '').trim();
    const teacherName = String(normalized['teacher_name'] ?? '').trim();
    const semester = String(normalized['semester'] ?? '').trim();

    if (!classCode || !subjectCode || !teacherName || !semester) {
      // silently skip rows missing required fields
      return null;
    }

    const rawCodes = String(normalized['student_codes_raw'] ?? '').trim();
    const studentCodes = rawCodes
      ? rawCodes.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    return {
      class_code: classCode,
      subject_code: subjectCode,
      teacher_name: teacherName,
      day_of_week: String(normalized['day_of_week'] ?? '').trim(),
      start_time: String(normalized['start_time'] ?? '').trim(),
      end_time: String(normalized['end_time'] ?? '').trim(),
      room: String(normalized['room'] ?? '').trim(),
      semester,
      student_codes: studentCodes,
    };
  }

  private async processRow(row: ImportClassRow, result: ImportClassResult) {
    // Check if class already exists → skip
    const existing = await this.prisma.classSection.findUnique({
      where: { class_code: row.class_code },
      select: { section_id: true },
    });
    if (existing) {
      result.skipped++;
      return;
    }

    // Resolve subject
    const subject = await this.prisma.subject.findUnique({
      where: { subject_code: row.subject_code },
      select: { subject_id: true },
    });
    if (!subject) {
      throw new NotFoundException(`Không tìm thấy môn học với mã "${row.subject_code}"`);
    }

    // Create class section
    const section = await this.prisma.classSection.create({
      data: {
        class_code: row.class_code,
        teacher_name: row.teacher_name,
        day_of_week: row.day_of_week || 'Thứ 2',
        start_time: row.start_time || '7:30',
        end_time: row.end_time || '9:30',
        room: row.room || 'TBA',
        semester: row.semester,
        status: 'UPCOMING',
        subject_id: subject.subject_id,
      },
    });
    result.created++;

    // Enroll students
    if (row.student_codes.length > 0) {
      const students = await this.prisma.student.findMany({
        where: { student_code: { in: row.student_codes } },
        select: { student_id: true, student_code: true },
      });

      if (students.length > 0) {
        await this.prisma.classEnrollment.createMany({
          data: students.map((s) => ({
            section_id: section.section_id,
            student_id: s.student_id,
          })),
          skipDuplicates: true,
        });
        result.enrolled += students.length;

        // Warn about not-found student codes
        const foundCodes = new Set(students.map((s) => s.student_code));
        const missing = row.student_codes.filter((c) => !foundCodes.has(c));
        if (missing.length > 0) {
          result.errors.push(
            `Lớp "${row.class_code}": Không tìm thấy MSSV: ${missing.join(', ')} (bỏ qua)`,
          );
        }
      }
    }
  }

  /** Download template: just returns a buffer of sample xlsx */
  generateTemplate(): Buffer {
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
        'Danh sách MSSV (cách nhau bởi dấu phẩy)': 'SV2024001,SV2024002',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    ws['!cols'] = [
      { wch: 10 }, { wch: 14 }, { wch: 28 }, { wch: 10 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 40 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
}
