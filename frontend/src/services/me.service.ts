import apiClient from '@/lib/axios';

export interface UpdateProfilePayload {
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface PreferenceEntry {
  key: string;
  value: string;
}

export const MeService = {
  /** PATCH /me/profile — Cập nhật hồ sơ cá nhân */
  async updateProfile(data: UpdateProfilePayload): Promise<unknown> {
    const res = await apiClient.patch('/me/profile', data);
    return res.data;
  },

  /** GET /me/preferences — Lấy preferences */
  async getPreferences(): Promise<Record<string, string>> {
    const res = await apiClient.get<Record<string, string>>('/me/preferences');
    return res.data;
  },

  /** PATCH /me/preferences — Cập nhật preferences */
  async upsertPreferences(
    preferences: PreferenceEntry[],
  ): Promise<Record<string, string>> {
    const res = await apiClient.patch<Record<string, string>>(
      '/me/preferences',
      { preferences },
    );
    return res.data;
  },
};
