'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { UserPlus, Smartphone, IdCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthService } from '@/services/auth.service';

interface ActivationStepProps {
  onOtpSent: (phone: string, studentCode: string) => void;
  onBackToLogin: () => void;
}

export function ActivationStep({
  onOtpSent,
  onBackToLogin,
}: ActivationStepProps) {
  const [phone, setPhone] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.requestOtp({ phone, student_code: studentCode });
      onOtpSent(phone, studentCode);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || '';
        if (err.response?.status === 429) {
          setError(message || 'Quá nhiều yêu cầu. Vui lòng thử lại sau.');
        } else {
          setError(message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        }
      } else {
        setError('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
          <UserPlus className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Kích Hoạt Tài Khoản
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Nhập số điện thoại và mã học sinh để bắt đầu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            id="phone"
            label="Số điện thoại"
            placeholder="0912345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10"
          />
          <Smartphone className="absolute left-3 top-[34px] h-5 w-5 text-gray-400" />
        </div>

        <div className="relative">
          <Input
            id="student-code"
            label="Mã học sinh"
            placeholder="HS001"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            className="pl-10"
          />
          <IdCard className="absolute left-3 top-[34px] h-5 w-5 text-gray-400" />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading || !phone || !studentCode}
        >
          {loading ? 'Đang gửi mã OTP...' : 'Gửi mã OTP'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={onBackToLogin}
          className="font-semibold text-blue-600 hover:underline"
        >
          Đăng nhập
        </button>
      </p>
    </div>
  );
}
