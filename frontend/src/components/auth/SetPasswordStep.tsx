'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthService } from '@/services/auth.service';

interface SetPasswordStepProps {
  phone: string;
  onComplete: () => void;
}

export function SetPasswordStep({ phone, onComplete }: SetPasswordStepProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      await AuthService.setPassword({ phone, password });
      onComplete();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
        );
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
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Đặt Mật Khẩu</h1>
        <p className="mt-2 text-sm text-gray-500">
          Tạo mật khẩu để bảo vệ tài khoản của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            id="new-password"
            label="Mật khẩu mới"
            type={showPassword ? 'text' : 'password'}
            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
          />
          <Lock className="absolute left-3 top-[34px] h-5 w-5 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            id="confirm-password"
            label="Xác nhận mật khẩu"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 pr-10"
          />
          <ShieldCheck className="absolute left-3 top-[34px] h-5 w-5 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showConfirm ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Mật khẩu phải có ít nhất 6 ký tự.
        </p>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading || !password || !confirmPassword}
        >
          {loading ? 'Đang xử lý...' : 'Hoàn tất'}
        </Button>
      </form>
    </div>
  );
}
