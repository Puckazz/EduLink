import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll() {
    return this.prisma.faq.findMany({
      orderBy: [
        { category: 'asc' },
        { sort_order: 'asc' },
        { created_at: 'asc' },
      ],
    });
  }

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

  async update(id: number, dto: UpdateFaqDto) {
    await this.findOneOrThrow(id);
    return this.prisma.faq.update({
      where: { faq_id: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOneOrThrow(id);
    await this.prisma.faq.delete({ where: { faq_id: id } });
  }

  private async findOneOrThrow(id: number) {
    const faq = await this.prisma.faq.findUnique({ where: { faq_id: id } });
    if (!faq) throw new NotFoundException(`FAQ #${id} không tìm thấy`);
    return faq;
  }
}
