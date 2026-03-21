import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

  create(createParentDto: CreateParentDto) {
    return 'This action adds a new parent';
  }

  findAll() {
    return `This action returns all parent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parent`;
  }

  update(id: number, updateParentDto: UpdateParentDto) {
    return `This action updates a #${id} parent`;
  }

  remove(id: number) {
    return `This action removes a #${id} parent`;
  }

  async getStudentsByParentId(parentId: number) {
    const parent = await this.prisma.parent.findUnique({
      where: { parent_id: parentId },
      select: { parent_id: true },
    });

    if (!parent) {
      throw new NotFoundException('Không tìm thấy phụ huynh');
    }

    return this.prisma.student.findMany({
      where: {
        parent_id: parentId,
        deleted_at: null,
      },
      include: {
        parent: {
          select: {
            parent_id: true,
            full_name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        student_id: 'desc',
      },
    });
  }
}
