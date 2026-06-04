'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import axios from 'axios';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { AuthService } from '@/services/auth.service';

interface OtpStepProps {
  phone: string;
  studentCode: string;
  onSimulationOtpChange: (otp?: string) => void;
  onVerified: () => void;
  onBackToActivation: () => void;
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  const start = phone.slice(0, 4);
  const end = phone.slice(-3);
  return `${start}***${end}`;
}

export function OtpStep({
  phone,
  studentCode,
  onSimulationOtpChange,
  onVerified,
  onBackToActivation,
}: OtpStepProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await AuthService.verifyOtp({ phone, otp });
      onVerified();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Mã OTP không hợp lệ.');
      } else {
        setError('Lỗi kết nối. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;

    try {
      const response = await AuthService.requestOtp({
        phone,
        student_code: studentCode,
      });
      onSimulationOtpChange(response.simulationOtp);
      setCooldown(60);
      setOtp('');
      setError('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Gửi lại mã OTP thất bại.');
      } else {
        setError('Lỗi kết nối. Vui lòng thử lại.');
      }
    }
  }, [cooldown, onSimulationOtpChange, phone, studentCode]);

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
          <ShieldAlert className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Xác Thực Danh Tính
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chúng tôi đã gửi mã 6 chữ số đến số điện thoại{' '}
          <span className="font-bold text-foreground">{maskPhone(phone)}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wide text-foreground">
            Nhập mã 6 chữ số
          </label>
          <div className="flex justify-start">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={loading}
              containerClassName="gap-2"
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="w-12 h-14 text-xl font-medium rounded-md border-border" />
                <InputOTPSlot index={1} className="w-12 h-14 text-xl font-medium rounded-md border-border" />
                <InputOTPSlot index={2} className="w-12 h-14 text-xl font-medium rounded-md border-border" />
                <InputOTPSlot index={3} className="w-12 h-14 text-xl font-medium rounded-md border-border" />
                <InputOTPSlot index={4} className="w-12 h-14 text-xl font-medium rounded-md border-border" />
                <InputOTPSlot index={5} className="w-12 h-14 text-xl font-medium rounded-md border-border" />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2 font-bold text-base h-12"
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Đang xác thực…' : 'Xác thực'}
        </Button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4 text-sm font-medium">
        <p className="text-muted-foreground">
          Chưa nhận được mã?{' '}
          {cooldown > 0 ? (
            <span className="text-muted-foreground/60">Gửi lại sau {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-bold text-primary hover:underline"
            >
              Gửi lại mã
            </button>
          )}
        </p>

        <button
          type="button"
          onClick={onBackToActivation}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
        >
          Trở về đăng nhập
        </button>
      </div>
    </div>
  );
}
