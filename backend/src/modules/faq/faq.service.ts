import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  // ── [Public] Lấy danh sách FAQ đang active, sắp xếp theo category + sort_order ──
  async findAllPublic() {
    return this.prisma.faq.findMany({
      where: { is_active: true },
      orderBy: [
        { category: 'asc' },
        { sort_order: 'asc' },
        { created_at: 'asc' },
      ],
    });
  }

  // ── [Admin] Lấy tất cả FAQ kể cả inactive ──────────────────────────────────
  async findAll() {
    return this.prisma.faq.findMany({
      orderBy: [
        { category: 'asc' },
        { sort_order: 'asc' },
        { created_at: 'asc' },
      ],
    });
  }

  // ── [Admin] Tạo FAQ mới ─────────────────────────────────────────────────────
  async create(dto: CreateFaqDto) {
    return this.prisma.faq.create({
      data: {
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
        sort_order: dto.sort_order ?? 0,
        is_active: dto.is_active ?? true,
      },
    });
  }

  // ── [Admin] Cập nhật FAQ ────────────────────────────────────────────────────
  async update(id: number, dto: UpdateFaqDto) {
    await this.findOneOrThrow(id);
    return this.prisma.faq.update({
      where: { faq_id: id },
      data: dto,
    });
  }

  // ── [Admin] Xóa FAQ ─────────────────────────────────────────────────────────
  async remove(id: number) {
    await this.findOneOrThrow(id);
    await this.prisma.faq.delete({ where: { faq_id: id } });
  }

  // ── Private helper ───────────────────────────────────────────────────────────
  private async findOneOrThrow(id: number) {
    const faq = await this.prisma.faq.findUnique({ where: { faq_id: id } });
    if (!faq) throw new NotFoundException(`FAQ #${id} không tìm thấy`);
    return faq;
  }
}
