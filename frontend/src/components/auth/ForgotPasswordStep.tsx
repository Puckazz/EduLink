'use client';

import { FormEvent, useState } from 'react';
import axios from 'axios';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ForgotPasswordStepProps {
  onBackToLogin: () => void;
  onSuccess: (message: string) => void;
}

export function ForgotPasswordStep({
  onBackToLogin,
  onSuccess,
}: ForgotPasswordStepProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parseError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      return (
        err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      );
    }

    return 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.';
  };

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await AuthService.requestForgotPasswordOtp({ phone });
      setSuccess(response.message);
      setOtpSent(true);
    } catch (err: unknown) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.resetForgotPassword({
        phone,
        otp,
        newPassword,
      });

      onSuccess(
        response.message || 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.',
      );
      onBackToLogin();
    } catch (err: unknown) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
          <KeyRound className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Quên Mật Khẩu
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {otpSent
            ? 'Nhập mã OTP và mật khẩu mới để hoàn tất đặt lại mật khẩu.'
            : 'Nhập số điện thoại đã đăng ký để nhận mã OTP đặt lại mật khẩu.'}
        </p>
      </div>

      {!otpSent ? (
        <form onSubmit={handleRequestOtp} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="forgot-phone"
              className="text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Số điện thoại
            </Label>
            <Input
              id="forgot-phone"
              name="forgot-phone"
              autoComplete="tel"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11"
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}
          {success ? (
            <p className="text-sm font-medium text-green-700">{success}</p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="mt-2 h-12 w-full text-base font-bold"
            disabled={loading || !phone}
          >
            {loading ? 'Đang gửi mã OTP…' : 'Gửi mã OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="forgot-otp"
              className="text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Mã OTP
            </Label>
            <Input
              id="forgot-otp"
              name="forgot-otp"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="forgot-new-password"
              className="text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="forgot-new-password"
                name="forgot-new-password"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Ít nhất 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                tabIndex={-1}
                aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="forgot-confirm-password"
              className="text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Xác nhận mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="forgot-confirm-password"
                name="forgot-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                tabIndex={-1}
                aria-label={
                  showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="mt-2 h-12 w-full text-base font-bold"
            disabled={loading || !otp || !newPassword || !confirmPassword}
          >
            {loading ? 'Đang đặt lại…' : 'Đặt lại mật khẩu'}
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
        <button
          type="button"
          onClick={onBackToLogin}
          className="font-bold text-primary hover:underline"
        >
          Quay lại đăng nhập
        </button>
      </p>
    </div>
  );
}
