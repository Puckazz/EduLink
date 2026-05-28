import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createPrismaMock,
  type PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import { TeacherService } from './teacher.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('TeacherService', () => {
  let service: TeacherService;
  let prisma: PrismaMock;

  const baseTeacher = {
    teacher_id: 1,
    username: 'teacher1',
    full_name: 'PGS.TS. Nguyễn Văn A',
    email: 'teacher1@edulink.vn',
    phone: '0988888881',
    avatar_url: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    _count: { classSections: 0 },
  };

  beforeEach(async () => {
    prisma = createPrismaMock();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<TeacherService>(TeacherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists teachers with pagination, search, and sort', async () => {
    prisma.teacher.count.mockResolvedValue(1);
    prisma.teacher.findMany.mockResolvedValue([baseTeacher]);

    const result = await service.findAll({
      page: '2',
      limit: '5',
      search: 'Nguyễn',
      sort: 'created_asc',
    });

    expect(prisma.teacher.count).toHaveBeenCalledWith({
      where: {
        OR: [
          { full_name: { contains: 'Nguyễn' } },
          { username: { contains: 'Nguyễn' } },
          { email: { contains: 'Nguyễn' } },
          { phone: { contains: 'Nguyễn' } },
        ],
      },
    });
    expect(prisma.teacher.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { created_at: 'asc' },
        skip: 5,
        take: 5,
      }),
    );
    expect(result.data[0].class_section_count).toBe(0);
    expect(result.meta).toEqual({
      totalItems: 1,
      totalPages: 1,
      currentPage: 2,
      pageSize: 5,
    });
  });

  it('creates teacher with hashed password', async () => {
    prisma.teacher.create.mockResolvedValue(baseTeacher);

    const result = await service.create({
      username: 'teacher1',
      password: 'teacher123',
      full_name: 'PGS.TS. Nguyễn Văn A',
      email: 'teacher1@edulink.vn',
      phone: '0988888881',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('teacher123', 10);
    expect(prisma.teacher.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: 'teacher1',
          password: 'hashed-password',
        }),
      }),
    );
    expect(result).not.toHaveProperty('password');
  });

  it('throws conflict when unique fields are duplicated', async () => {
    prisma.teacher.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.22.0',
      }),
    );

    await expect(
      service.create({
        username: 'teacher1',
        password: 'teacher123',
        full_name: 'PGS.TS. Nguyễn Văn A',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates teacher without changing password when password is omitted', async () => {
    prisma.teacher.findUnique.mockResolvedValue(baseTeacher);
    prisma.teacher.update.mockResolvedValue({
      ...baseTeacher,
      full_name: 'TS. Nguyễn Văn A',
    });

    await service.update(1, { full_name: 'TS. Nguyễn Văn A' });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(prisma.teacher.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { full_name: 'TS. Nguyễn Văn A' },
      }),
    );
  });

  it('deletes teacher when no class section is assigned', async () => {
    prisma.teacher.findUnique.mockResolvedValue(baseTeacher);
    prisma.teacher.delete.mockResolvedValue(baseTeacher);

    await expect(service.remove(1)).resolves.toEqual({
      message: 'Xóa giảng viên thành công',
    });
    expect(prisma.teacher.delete).toHaveBeenCalledWith({
      where: { teacher_id: 1 },
    });
  });

  it('blocks deleting teacher assigned to class sections', async () => {
    prisma.teacher.findUnique.mockResolvedValue({
      ...baseTeacher,
      _count: { classSections: 2 },
    });

    await expect(service.remove(1)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.teacher.delete).not.toHaveBeenCalled();
  });
});
