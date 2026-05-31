import apiClient from '@/lib/axios';

export interface UpdateProfilePayload {
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string | null;
}

export interface AvatarUploadResponse {
  url: string;
  publicId: string;
}

export interface PreferenceEntry {
  key: string;
  value: string;
}

export const MeService = {
  async updateProfile(data: UpdateProfilePayload): Promise<unknown> {
    const res = await apiClient.patch('/me/profile', data);
    return res.data;
  },

  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<AvatarUploadResponse>('/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteAvatar(publicId: string): Promise<void> {
    await apiClient.delete('/me/avatar', {
      params: { publicId },
    });
  },

  async getPreferences(): Promise<Record<string, string>> {
    const res = await apiClient.get<Record<string, string>>('/me/preferences');
    return res.data;
  },

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
