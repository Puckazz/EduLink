import apiClient, { endAuthSessionEnd } from '@/lib/axios';
import type {
  LoginRequest,
  LoginResponse,
  AuthProfile,
  ActivationRequest,
  OtpResponse,
  OtpVerifyRequest,
  SetPasswordRequest,
  ForgotPasswordOtpRequest,
  ForgotPasswordResetRequest,
  ChangePasswordRequest,
} from '@/types/auth';

export const AuthService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/auth/login', data);
    endAuthSessionEnd();
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

  async requestForgotPasswordOtp(
    data: ForgotPasswordOtpRequest,
  ): Promise<OtpResponse> {
    const res = await apiClient.post<OtpResponse>(
      '/auth/forgot-password/request-otp',
      data,
    );
    return res.data;
  },

  async resetForgotPassword(
    data: ForgotPasswordResetRequest,
  ): Promise<OtpResponse> {
    const res = await apiClient.post<OtpResponse>(
      '/auth/forgot-password/reset',
      data,
    );
    return res.data;
  },

  async getProfile(): Promise<AuthProfile> {
    const res = await apiClient.get<AuthProfile>('/auth/profile');
    return res.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const res = await apiClient.patch<{ message: string }>(
      '/auth/change-password',
      data,
    );
    return res.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
