'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { GraduationCap, User, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthService } from '@/services/auth.service';
import type { LoginResponse } from '@/types/auth';

interface LoginStepProps {
  onSuccess: (response: LoginResponse) => void;
  onSwitchToActivation: () => void;
}

export function LoginStep({
  onSuccess,
  onSwitchToActivation,
}: LoginStepProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await AuthService.login({ identifier, password });
      onSuccess(response);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || '';
        if (
          message.includes('chưa được kích hoạt') ||
          message.includes('chưa đặt mật khẩu') ||
          message.includes('hoàn tất quy trình kích hoạt')
        ) {
          setError(message);
          setTimeout(() => onSwitchToActivation(), 1500);
          return;
        }
        setError(message || 'Tài khoản hoặc mật khẩu không đúng.');
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
          <GraduationCap className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Cổng Đăng Nhập</h1>
        <p className="mt-2 text-sm text-gray-500">
          Đăng nhập để quản lý hồ sơ học tập và liên lạc.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            id="identifier"
            label="Tên đăng nhập hoặc Số điện thoại"
            placeholder="admin hoặc 0912345678"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="pl-10"
          />
          <User className="absolute left-3 top-[34px] h-5 w-5 text-gray-400" />
        </div>

        <div className="relative">
          <Input
            id="password"
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            placeholder="Nhập mật khẩu"
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

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading || !identifier || !password}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToActivation}
          className="font-semibold text-blue-600 hover:underline"
        >
          Kích hoạt tài khoản
        </button>
      </p>
    </div>
  );
}
