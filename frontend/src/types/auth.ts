export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface User {
  id: number;
  fullName: string;
  role: 'admin' | 'parent';
  email?: string | null;
  phone?: string;
  username?: string;
}

export interface ActivationRequest {
  phone: string;
  student_code: string;
}

export interface OtpResponse {
  message: string;
  phone: string;
}

export interface OtpVerifyRequest {
  phone: string;
  otp: string;
}

export interface SetPasswordRequest {
  phone: string;
  password: string;
}

export type AuthStep = 'login' | 'activation' | 'otp' | 'set-password';
