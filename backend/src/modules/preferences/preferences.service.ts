import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertPreferencesDto } from './dto/upsert-preference.dto';

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy tất cả preferences của một user theo role.
   * Trả về dạng object key-value cho tiện dùng ở frontend.
   */
  async getPreferences(
    role: string,
    userId: number,
  ): Promise<Record<string, string>> {
    const prefs = await this.prisma.userPreference.findMany({
      where: { role, user_id: userId },
      select: { key: true, value: true },
    });

    return Object.fromEntries(prefs.map((p) => [p.key, p.value]));
  }

  /**
   * Upsert nhiều preferences cùng lúc cho một user.
   */
  async upsertPreferences(
    role: string,
    userId: number,
    dto: UpsertPreferencesDto,
  ): Promise<Record<string, string>> {
    await this.prisma.$transaction(
      dto.preferences.map((pref) =>
        this.prisma.userPreference.upsert({
          where: {
            role_user_id_key: {
              role,
              user_id: userId,
              key: pref.key,
            },
          },
          update: { value: pref.value },
          create: {
            role,
            user_id: userId,
            key: pref.key,
            value: pref.value,
          },
        }),
      ),
    );

    return this.getPreferences(role, userId);
  }
}
