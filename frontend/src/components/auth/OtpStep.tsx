'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/ui/OtpInput';
import { AuthService } from '@/services/auth.service';

interface OtpStepProps {
  phone: string;
  studentCode: string;
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
        setError(err.response?.data?.message || 'Mã OTP không đúng.');
      } else {
        setError('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;

    try {
      await AuthService.requestOtp({ phone, student_code: studentCode });
      setCooldown(60);
      setOtp('');
      setError('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Không thể gửi lại mã OTP.');
      } else {
        setError('Lỗi kết nối. Vui lòng thử lại.');
      }
    }
  }, [cooldown, phone, studentCode]);

  return (
    <div>
      <div className="mb-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Xác Thực Danh Tính</h1>
        <p className="mt-2 text-sm text-gray-500">
          Chúng tôi đã gửi mã 6 chữ số đến số điện thoại{' '}
          <span className="font-medium text-gray-700">{maskPhone(phone)}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Nhập mã 6 chữ số
          </label>
          <OtpInput
            value={otp}
            onChange={setOtp}
            error={error}
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Đang xác thực...' : 'Xác thực'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Không nhận được mã?{' '}
        {cooldown > 0 ? (
          <span className="text-gray-400">Gửi lại sau {cooldown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-blue-600 hover:underline"
          >
            Gửi lại
          </button>
        )}
      </p>

      <p className="mt-2 text-center">
        <button
          type="button"
          onClick={onBackToActivation}
          className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
        >
          Quay lại
        </button>
      </p>
    </div>
  );
}
