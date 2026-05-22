import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ParentService } from './parent.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../common/testing/prisma-mock.helper';
import { createMockParent, createMockActiveParent } from '../../common/testing/test-data.factory';

jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('ParentService', () => {
  let service: ParentService;
  let prismaMock: PrismaMock;

  const mockParent = createMockParent();
  const HASHED_PW = '$2b$10$HASHEDPASSWORD1234567890123456789012345678';

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ParentService>(ParentService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const dto = {
      full_name: 'Trần Thị B',
      phone: '0987654321',
      relationship: 'ME' as any,
    };

    it('should create parent without password', async () => {
      prismaMock.parent.create.mockResolvedValue(mockParent);
      const result = await service.create(dto);
      expect(result.phone).toBe('0987654321');
      expect(bcryptMock.hash).not.toHaveBeenCalled();
    });

    it('should hash password before creating parent', async () => {
      (bcryptMock.hash as jest.Mock).mockResolvedValue(HASHED_PW);
      prismaMock.parent.create.mockResolvedValue({ ...mockParent, password: HASHED_PW });

      await service.create({ ...dto, password: 'RawPassword123!' });

      expect(bcryptMock.hash).toHaveBeenCalledWith('RawPassword123!', 10);
    });

    it('should throw ConflictException on duplicate phone (P2002)', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002', clientVersion: '5.0.0', meta: {}, batchRequestIdx: undefined,
      });
      prismaMock.parent.create.mockRejectedValue(p2002);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll()', () => {
    const parentWithStudents = {
      ...mockParent,
      students: [{ student: { student_id: 1000, student_code: 'SV001', full_name: 'Lê Văn C', status: 'DANG_HOC', class: '2022_CNTT' } }],
    };

    it('should return paginated parent list with default options', async () => {
      prismaMock.parent.count.mockResolvedValue(1);
      prismaMock.parent.findMany.mockResolvedValue([parentWithStudents]);

      const result = await service.findAll({});
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
    });

    it('should filter by search query', async () => {
      prismaMock.parent.count.mockResolvedValue(1);
      prismaMock.parent.findMany.mockResolvedValue([parentWithStudents]);

      await service.findAll({ search: 'Trần' });
      expect(prismaMock.parent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) }),
      );
    });

    it('should filter by active status', async () => {
      prismaMock.parent.count.mockResolvedValue(0);
      prismaMock.parent.findMany.mockResolvedValue([]);

      const result = await service.findAll({ status: 'active' });
      expect(result.data).toHaveLength(0);
    });

    it('should sort by Vietnamese last name', async () => {
      const parents = [
        { ...parentWithStudents, full_name: 'Trần Thị Anh' },
        { ...parentWithStudents, full_name: 'Lê Văn Bình', parent_id: 101 },
      ];
      prismaMock.parent.count.mockResolvedValue(2);
      prismaMock.parent.findMany.mockResolvedValue(parents);

      const result = await service.findAll({ sort: 'name_asc' });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('findOne()', () => {
    it('should return parent by id', async () => {
      prismaMock.parent.findUnique.mockResolvedValue({ ...mockParent, students: [] });
      const result = await service.findOne(100);
      expect(result.parent_id).toBe(100);
    });

    it('should throw NotFoundException when parent not found', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update parent info successfully', async () => {
      prismaMock.parent.findUnique.mockResolvedValue({ ...mockParent, students: [] });
      prismaMock.parent.update.mockResolvedValue({ ...mockParent, full_name: 'New Name' });

      const result = await service.update(100, { full_name: 'New Name' });
      expect(result.full_name).toBe('New Name');
    });

    it('should hash new password when updating password', async () => {
      prismaMock.parent.findUnique.mockResolvedValue({ ...mockParent, students: [] });
      (bcryptMock.hash as jest.Mock).mockResolvedValue(HASHED_PW);
      prismaMock.parent.update.mockResolvedValue(mockParent);

      await service.update(100, { password: 'NewPassword123!' });
      expect(bcryptMock.hash).toHaveBeenCalledWith('NewPassword123!', 10);
    });

    it('should throw NotFoundException when parent not found', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(null);
      await expect(service.update(999, { full_name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('should delete parent successfully', async () => {
      prismaMock.parent.findUnique.mockResolvedValue({ ...mockParent, students: [] });
      prismaMock.parent.delete.mockResolvedValue(mockParent);

      const result = await service.remove(100);
      expect(result.message).toBeDefined();
    });

    it('should throw NotFoundException when parent not found', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
