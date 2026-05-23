import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AcademicPeriodStatus, AcademicTermCode } from '@prisma/client';
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
  student_codes: string[];
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
    let rows: ImportClassRow[];
    try {
      rows = this.parseExcel(buffer);
    } catch {
      throw new BadRequestException(
        'Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.',
      );
    }

    if (rows.length === 0) {
      throw new BadRequestException('File Excel không có dòng dữ liệu hợp lệ.');
    }

    const result: ImportClassResult = {
      created: 0,
      skipped: 0,
      enrolled: 0,
      errors: [],
    };

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

  private parseExcel(buffer: Buffer): ImportClassRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
    });

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
      return null;
    }

    const rawCodes = String(normalized['student_codes_raw'] ?? '').trim();
    const studentCodes = rawCodes
      ? rawCodes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
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
    const existing = await this.prisma.classSection.findUnique({
      where: { class_code: row.class_code },
      select: { section_id: true },
    });
    if (existing) {
      result.skipped++;
      return;
    }

    const subject = await this.prisma.subject.findUnique({
      where: { subject_code: row.subject_code },
      select: { subject_id: true },
    });
    if (!subject) {
      throw new NotFoundException(
        `Không tìm thấy môn học với mã "${row.subject_code}"`,
      );
    }

    const term = await this.resolveTerm(row.semester);

    const section = await this.prisma.classSection.create({
      data: {
        class_code: row.class_code,
        teacher_name: row.teacher_name,
        day_of_week: row.day_of_week || 'Thứ 2',
        start_time: row.start_time || '7:30',
        end_time: row.end_time || '9:30',
        room: row.room || 'TBA',
        term_id: term.term_id,
        status: 'UPCOMING',
        subject_id: subject.subject_id,
      },
    });
    result.created++;

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

  private parseSemester(raw: string): { code: AcademicTermCode; year: number } {
    const trimmed = raw.trim().toUpperCase();
    const match = trimmed.match(/^(HK1|HK2|HKH)[-/\s]*(\d{4})$/);
    if (!match) {
      throw new BadRequestException(
        `Học kỳ "${raw}" không hợp lệ. Vui lòng dùng dạng HK1-2025, HK2/2025 hoặc HKH-2025.`,
      );
    }
    return {
      code: match[1] as AcademicTermCode,
      year: Number(match[2]),
    };
  }

  private getAcademicYearName(year: number) {
    return `${year} - ${year + 1}`;
  }

  private getAcademicYearDates(year: number) {
    return {
      start_date: new Date(`${year}-09-01T00:00:00.000Z`),
      end_date: new Date(`${year + 1}-08-31T00:00:00.000Z`),
    };
  }

  private getTermName(code: AcademicTermCode, academicYearName: string) {
    const label =
      code === AcademicTermCode.HK1
        ? 'Học kỳ I'
        : code === AcademicTermCode.HK2
          ? 'Học kỳ II'
          : 'Học kỳ hè';
    return `${label} - ${academicYearName}`;
  }

  private getTermDates(code: AcademicTermCode, year: number) {
    if (code === AcademicTermCode.HK1) {
      return {
        start_date: new Date(`${year}-09-01T00:00:00.000Z`),
        end_date: new Date(`${year + 1}-01-15T00:00:00.000Z`),
      };
    }
    if (code === AcademicTermCode.HK2) {
      return {
        start_date: new Date(`${year + 1}-02-01T00:00:00.000Z`),
        end_date: new Date(`${year + 1}-06-15T00:00:00.000Z`),
      };
    }
    return {
      start_date: new Date(`${year + 1}-06-16T00:00:00.000Z`),
      end_date: new Date(`${year + 1}-08-31T00:00:00.000Z`),
    };
  }

  private async resolveTerm(raw: string) {
    const parsed = this.parseSemester(raw);
    const academicYearName = this.getAcademicYearName(parsed.year);
    const academicYearDates = this.getAcademicYearDates(parsed.year);
    const academicYear = await this.prisma.academicYear.upsert({
      where: { name: academicYearName },
      update: {},
      create: {
        name: academicYearName,
        start_date: academicYearDates.start_date,
        end_date: academicYearDates.end_date,
        status: AcademicPeriodStatus.UPCOMING,
      },
      select: { academic_year_id: true, name: true },
    });
    const termDates = this.getTermDates(parsed.code, parsed.year);
    return this.prisma.academicTerm.upsert({
      where: {
        academic_year_id_code: {
          academic_year_id: academicYear.academic_year_id,
          code: parsed.code,
        },
      },
      update: {},
      create: {
        code: parsed.code,
        academic_year_id: academicYear.academic_year_id,
        name: this.getTermName(parsed.code, academicYear.name),
        start_date: termDates.start_date,
        end_date: termDates.end_date,
        status: AcademicPeriodStatus.UPCOMING,
      },
      select: { term_id: true },
    });
  }

  /** Download template: just returns a buffer of sample xlsx */
  generateTemplate(): Buffer {
    const sampleRows = [
      {
        'Mã lớp': 'L01',
        'Mã môn học': 'INT101',
        'Tên giảng viên': 'PGS.TS. Nguyễn Văn A',
        Thứ: 'Thứ 2',
        'Giờ bắt đầu': '7:30',
        'Giờ kết thúc': '9:30',
        Phòng: 'A1.202',
        'Học kỳ': 'HK1-2024',
        'Danh sách MSSV (cách nhau bởi dấu phẩy)': 'SV2024001,SV2024002',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    ws['!cols'] = [
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
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
}
