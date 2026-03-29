import { Injectable } from '@nestjs/common';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MajorService {
  constructor(private readonly prisma: PrismaService) {}

  create(_createMajorDto: CreateMajorDto) {
    void _createMajorDto;
    return 'This action adds a new major';
  }

  async findAll() {
    return this.prisma.major.findMany({
      select: {
        major_id: true,
        major_code: true,
        major_name: true,
        created_at: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        major_name: 'asc',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} major`;
  }

  update(id: number, _updateMajorDto: UpdateMajorDto) {
    void _updateMajorDto;
    return `This action updates a #${id} major`;
  }

  remove(id: number) {
    return `This action removes a #${id} major`;
  }
}
