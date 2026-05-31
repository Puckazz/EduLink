import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import {
  createMockAdmin,
  createMockTeacher,
  createMockParent,
  createMockActiveParent,
  createMockStudent,
  createMockOtp,
  createExpiredOtp,
} from '../../common/testing/test-data.factory';

jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: PrismaMock;
  let jwtServiceMock: jest.Mocked<JwtService>;

  const HASHED_PW = '$2b$10$HASHEDPASSWORD1234567890123456789012345678';
  const ACCESS_TOKEN = 'mock_access_token';
  const REFRESH_TOKEN = 'mock_refresh_token';

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    jwtServiceMock = {
      signAsync: jest.fn().mockResolvedValue(ACCESS_TOKEN),
      verify: jest.fn(),
    } as any;
    const configServiceMock = {
      get: jest.fn().mockImplementation((key: string, def?: any) => {
        const cfg: Record<string, string> = {
          JWT_ACCESS_SECRET: 'test_access_secret',
          JWT_REFRESH_SECRET: 'test_refresh_secret',
          JWT_ACCESS_EXPIRES_IN: '15m',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return cfg[key] ?? def;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestOtp()', () => {
    const dto = { phone: '0987654321', student_code: 'SV001' };

    it('should issue OTP when student and parent phone match', async () => {
      prismaMock.student.findFirst.mockResolvedValue(
        createMockStudent({
          parents: [{ parent: createMockParent({ phone: dto.phone }) }],
        }),
      );
      prismaMock.otp.deleteMany.mockResolvedValue({ count: 0 });
      prismaMock.otp.create.mockResolvedValue(createMockOtp());

      const result = await service.requestOtp(dto);

      expect(result).toMatchObject({ phone: dto.phone });
      expect(prismaMock.otp.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when student not found', async () => {
      prismaMock.student.findFirst.mockResolvedValue(null);
      await expect(service.requestOtp(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when student has no parents', async () => {
      prismaMock.student.findFirst.mockResolvedValue(
        createMockStudent({ parents: [] }),
      );
      await expect(service.requestOtp(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when phone does not match any parent', async () => {
      prismaMock.student.findFirst.mockResolvedValue(
        createMockStudent({
          parents: [{ parent: createMockParent({ phone: '0000000000' }) }],
        }),
      );
      await expect(service.requestOtp(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when parent account already activated', async () => {
      prismaMock.student.findFirst.mockResolvedValue(
        createMockStudent({
          parents: [{ parent: createMockActiveParent({ phone: dto.phone }) }],
        }),
      );
      await expect(service.requestOtp(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyOtp()', () => {
    const dto = { phone: '0987654321', otp: '123456' };

    it('should verify OTP successfully', async () => {
      prismaMock.otp.findFirst.mockResolvedValue(
        createMockOtp({ otp_code: '123456' }),
      );
      prismaMock.otp.update.mockResolvedValue({});
      const result = await service.verifyOtp(dto);
      expect(result).toMatchObject({ phone: dto.phone });
      expect(prismaMock.otp.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { is_used: true } }),
      );
    });

    it('should throw BadRequestException when OTP record not found', async () => {
      prismaMock.otp.findFirst.mockResolvedValue(null);
      await expect(service.verifyOtp(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when OTP is expired', async () => {
      prismaMock.otp.findFirst.mockResolvedValue(
        createExpiredOtp({ otp_code: '123456' }),
      );
      await expect(service.verifyOtp(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when OTP code mismatch', async () => {
      prismaMock.otp.findFirst.mockResolvedValue(
        createMockOtp({ otp_code: '999999' }),
      );
      await expect(service.verifyOtp(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('setPassword()', () => {
    const dto = { phone: '0987654321', password: 'NewPass123!' };

    it('should set password after OTP verified', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockParent({ phone: dto.phone }),
      );
      prismaMock.otp.findFirst.mockResolvedValue(
        createMockOtp({ is_used: true }),
      );
      (bcryptMock.hash as jest.Mock).mockResolvedValue(HASHED_PW);
      prismaMock.parent.update.mockResolvedValue({});
      const result = await service.setPassword(dto);
      expect(result).toMatchObject({ phone: dto.phone });
    });

    it('should throw NotFoundException when parent not found', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(null);
      await expect(service.setPassword(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when OTP was not verified', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockParent({ phone: dto.phone }),
      );
      prismaMock.otp.findFirst.mockResolvedValue(null);
      await expect(service.setPassword(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login()', () => {
    beforeEach(() => {
      jwtServiceMock.signAsync
        .mockResolvedValueOnce(ACCESS_TOKEN)
        .mockResolvedValueOnce(REFRESH_TOKEN);
    });

    it('should login admin successfully', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(createMockAdmin());
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.admin.update.mockResolvedValue({});
      const result = await service.login({
        identifier: 'admin',
        password: 'pass',
      });
      expect(result.user.role).toBe('admin');
      expect(prismaMock.admin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            refresh_token_hash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
          },
        }),
      );
    });

    it('should throw UnauthorizedException for wrong admin password', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(createMockAdmin());
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login({ identifier: 'admin', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should login teacher successfully', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(null);
      prismaMock.teacher.findUnique.mockResolvedValue(createMockTeacher());
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.teacher.update.mockResolvedValue({});
      const result = await service.login({
        identifier: 'teacher01',
        password: 'pass',
      });
      expect(result.user.role).toBe('teacher');
    });

    it('should throw UnauthorizedException when teacher has no password', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(null);
      prismaMock.teacher.findUnique.mockResolvedValue(
        createMockTeacher({ password: null }),
      );
      await expect(
        service.login({ identifier: 'teacher01', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should login parent successfully', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(null);
      prismaMock.teacher.findUnique.mockResolvedValue(null);
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockActiveParent({ phone: '0987654321', password: HASHED_PW }),
      );
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.parent.update.mockResolvedValue({});
      const result = await service.login({
        identifier: '0987654321',
        password: 'pass',
      });
      expect(result.user.role).toBe('parent');
    });

    it('should throw UnauthorizedException when parent not activated', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(null);
      prismaMock.teacher.findUnique.mockResolvedValue(null);
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockParent({ is_active: false }),
      );
      await expect(
        service.login({ identifier: '0987654321', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when parent is locked', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(null);
      prismaMock.teacher.findUnique.mockResolvedValue(null);
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockActiveParent({ is_locked: true }),
      );
      await expect(
        service.login({ identifier: '0987654321', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(bcryptMock.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when no user found', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(null);
      prismaMock.teacher.findUnique.mockResolvedValue(null);
      prismaMock.parent.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ identifier: 'unknown', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh()', () => {
    it('should throw UnauthorizedException when no token provided', async () => {
      await expect(service.refresh(undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error('invalid');
      });
      await expect(service.refresh('bad_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should refresh admin token successfully', async () => {
      jwtServiceMock.verify.mockReturnValue({
        sub: 1,
        username: 'admin',
        role: 'admin',
      });
      prismaMock.admin.findUnique.mockResolvedValue(
        createMockAdmin({ refresh_token_hash: HASHED_PW }),
      );
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.signAsync.mockResolvedValue(ACCESS_TOKEN);
      const result = await service.refresh(REFRESH_TOKEN);
      expect(result.user.role).toBe('admin');
    });

    it('should throw UnauthorizedException when token hash mismatch', async () => {
      jwtServiceMock.verify.mockReturnValue({
        sub: 1,
        username: 'admin',
        role: 'admin',
      });
      prismaMock.admin.findUnique.mockResolvedValue(
        createMockAdmin({ refresh_token_hash: HASHED_PW }),
      );
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.refresh(REFRESH_TOKEN)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should refresh parent token successfully', async () => {
      jwtServiceMock.verify.mockReturnValue({
        sub: 100,
        phone: '0987654321',
        role: 'parent',
      });
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockActiveParent({ refresh_token_hash: HASHED_PW }),
      );
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.signAsync.mockResolvedValue(ACCESS_TOKEN);
      const result = await service.refresh(REFRESH_TOKEN);
      expect(result.user.role).toBe('parent');
    });

    it('should throw UnauthorizedException when refreshing locked parent token', async () => {
      jwtServiceMock.verify.mockReturnValue({
        sub: 100,
        phone: '0987654321',
        role: 'parent',
      });
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockActiveParent({
          is_locked: true,
          refresh_token_hash: HASHED_PW,
        }),
      );

      await expect(service.refresh(REFRESH_TOKEN)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile()', () => {
    it('should return admin profile', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(createMockAdmin());
      const result = await service.getProfile({ userId: 1, role: 'admin' });
      expect(result.role).toBe('admin');
    });

    it('should return teacher profile', async () => {
      prismaMock.teacher.findUnique.mockResolvedValue(createMockTeacher());
      const result = await service.getProfile({ userId: 10, role: 'teacher' });
      expect(result.role).toBe('teacher');
    });

    it('should return parent profile with students list', async () => {
      prismaMock.parent.findUnique.mockResolvedValue({
        ...createMockActiveParent(),
        students: [{ student: createMockStudent() }],
      });
      const result = (await service.getProfile({
        userId: 100,
        role: 'parent',
      })) as any;
      expect(result.role).toBe('parent');
      expect(result.students).toHaveLength(1);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(null);
      await expect(
        service.getProfile({ userId: 999, role: 'admin' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword()', () => {
    const dto = { oldPassword: 'OldPass!', newPassword: 'NewPass!' };

    it('should change password for admin successfully', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(
        createMockAdmin({ password: HASHED_PW }),
      );
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('$2b$10$NEWHASH');
      prismaMock.admin.update.mockResolvedValue({});
      const result = await service.changePassword(
        { userId: 1, role: 'admin' },
        dto,
      );
      expect(result.message).toBeDefined();
    });

    it('should throw BadRequestException for wrong old password', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(
        createMockAdmin({ password: HASHED_PW }),
      );
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.changePassword({ userId: 1, role: 'admin' }, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout()', () => {
    it('should clear admin refresh token', async () => {
      prismaMock.admin.update.mockResolvedValue({});
      const result = await service.logout({ userId: 1, role: 'admin' });
      expect(prismaMock.admin.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { refresh_token_hash: null } }),
      );
      expect(result.message).toBeDefined();
    });

    it('should clear teacher refresh token', async () => {
      prismaMock.teacher.update.mockResolvedValue({});
      await service.logout({ userId: 10, role: 'teacher' });
      expect(prismaMock.teacher.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { refresh_token_hash: null } }),
      );
    });

    it('should clear parent refresh token', async () => {
      prismaMock.parent.update.mockResolvedValue({});
      await service.logout({ userId: 100, role: 'parent' });
      expect(prismaMock.parent.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { refresh_token_hash: null } }),
      );
    });
  });

  describe('logoutFromTokens()', () => {
    it('should clear refresh token from a signed refresh token payload', async () => {
      jwtServiceMock.verify.mockReturnValue({
        sub: 10,
        username: 'teacher1',
        role: 'teacher',
      });
      prismaMock.teacher.update.mockResolvedValue({});

      await service.logoutFromTokens(undefined, REFRESH_TOKEN);

      expect(jwtServiceMock.verify).toHaveBeenCalledWith(
        REFRESH_TOKEN,
        expect.objectContaining({
          secret: 'test_refresh_secret',
          ignoreExpiration: true,
        }),
      );
      expect(prismaMock.teacher.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teacher_id: 10 },
          data: { refresh_token_hash: null },
        }),
      );
    });

    it('should ignore missing or invalid logout tokens', async () => {
      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await service.logoutFromTokens(undefined, REFRESH_TOKEN);

      expect(prismaMock.admin.update).not.toHaveBeenCalled();
      expect(prismaMock.teacher.update).not.toHaveBeenCalled();
      expect(prismaMock.parent.update).not.toHaveBeenCalled();
    });
  });

  describe('requestForgotPasswordOtp()', () => {
    const dto = { phone: '0987654321' };

    it('should issue OTP for active account', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockActiveParent({ phone: dto.phone }),
      );
      prismaMock.otp.deleteMany.mockResolvedValue({ count: 0 });
      prismaMock.otp.create.mockResolvedValue(createMockOtp());
      const result = await service.requestForgotPasswordOtp(dto);
      expect(result).toMatchObject({ phone: dto.phone });
    });

    it('should throw BadRequestException for inactive account', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockParent({ is_active: false }),
      );
      await expect(service.requestForgotPasswordOtp(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for locked account', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockActiveParent({ is_locked: true }),
      );
      await expect(service.requestForgotPasswordOtp(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when parent not found', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(null);
      await expect(service.requestForgotPasswordOtp(dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetForgotPassword()', () => {
    const dto = { phone: '0987654321', otp: '123456', newPassword: 'NewPass!' };

    it('should reset password successfully', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockActiveParent({ phone: dto.phone }),
      );
      prismaMock.otp.findFirst.mockResolvedValue(
        createMockOtp({ otp_code: dto.otp }),
      );
      (bcryptMock.hash as jest.Mock).mockResolvedValue('$2b$10$NEWHASH');
      prismaMock.$transaction.mockResolvedValue([{}, {}]);
      const result = await service.resetForgotPassword(dto);
      expect(result).toMatchObject({ phone: dto.phone });
    });

    it('should throw BadRequestException for wrong OTP code', async () => {
      prismaMock.parent.findUnique.mockResolvedValue(
        createMockActiveParent({ phone: dto.phone }),
      );
      prismaMock.otp.findFirst.mockResolvedValue(
        createMockOtp({ otp_code: '999999' }),
      );
      await expect(service.resetForgotPassword(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
