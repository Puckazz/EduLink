export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  message: string;
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

export interface AdminProfile {
  admin_id: number;
  username: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  role: 'admin';
}

export interface ParentProfileStudent {
  student_id: number;
  student_code: string;
  full_name: string;
  class: string | null;
  study_year: number | null;
  major: { major_name: string } | null;
}

export interface ParentProfile {
  parent_id: number;
  full_name: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  students: ParentProfileStudent[];
  role: 'parent';
}

export type AuthProfile = AdminProfile | ParentProfile;

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

export interface ForgotPasswordOtpRequest {
  phone: string;
}

export interface ForgotPasswordResetRequest {
  phone: string;
  otp: string;
  newPassword: string;
}

export type AuthStep =
  | 'login'
  | 'activation'
  | 'otp'
  | 'set-password'
  | 'forgot-password';
