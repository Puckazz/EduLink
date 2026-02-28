import apiClient from '@/lib/axios';
import type {
  LoginRequest,
  LoginResponse,
  User,
  ActivationRequest,
  OtpResponse,
  OtpVerifyRequest,
  SetPasswordRequest,
} from '@/types/auth';

export const AuthService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/auth/login', data);
    return res.data;
  },

  async requestOtp(data: ActivationRequest): Promise<OtpResponse> {
    const res = await apiClient.post<OtpResponse>('/auth/request-otp', data);
    return res.data;
  },

  async verifyOtp(data: OtpVerifyRequest): Promise<OtpResponse> {
    const res = await apiClient.post<OtpResponse>('/auth/verify-otp', data);
    return res.data;
  },

  async setPassword(data: SetPasswordRequest): Promise<OtpResponse> {
    const res = await apiClient.post<OtpResponse>('/auth/set-password', data);
    return res.data;
  },

  async getProfile(): Promise<User> {
    const res = await apiClient.get<User>('/auth/profile');
    return res.data;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  },
};
