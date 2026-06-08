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
