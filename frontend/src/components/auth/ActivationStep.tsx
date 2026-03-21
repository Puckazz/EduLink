'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { UserPlus, Smartphone, IdCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
          <UserPlus className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Kích Hoạt Tài Khoản
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nhập số điện thoại và mã học sinh để bắt đầu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wide text-foreground">
            Số điện thoại
          </Label>
          <div className="relative">
            <Input
              id="phone"
              name="phone"
              autoComplete="tel"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 pl-10"
            />
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-code" className="text-xs font-bold uppercase tracking-wide text-foreground">
            Mã học sinh
          </Label>
          <div className="relative">
            <Input
              id="student-code"
              name="student-code"
              placeholder="HS001"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              className="h-11 pl-10"
            />
            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2 font-bold text-base h-12"
          disabled={loading || !phone || !studentCode}
        >
          {loading ? 'Đang gửi mã OTP…' : 'Gửi mã OTP'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={onBackToLogin}
          className="font-bold text-primary hover:underline"
        >
          Đăng nhập
        </button>
      </p>
    </div>
  );
}
