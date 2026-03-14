'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { UserCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthService } from '@/services/auth.service';
import type { LoginResponse } from '@/types/auth';
import { Spinner } from '@/components/ui/spinner';

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
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
          <UserCircle2 className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          Cổng Đăng Nhập
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đăng nhập để quản lý hồ sơ học tập và liên lạc.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login" className="text-xs font-bold uppercase tracking-wide text-primary">
            Tên đăng nhập hoặc Số điện thoại
          </Label>
          <Input
            id="identifier"
            name="username"
            autoComplete="username"
            spellCheck={false}
            placeholder="admin@university.edu"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-primary">
              Mật khẩu
            </Label>
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu…"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2 font-bold text-base h-12"
          disabled={loading || !identifier || !password}
        >
          {loading ? <Spinner className="size-6" /> : 'Đăng nhập'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToActivation}
          className="font-bold text-primary hover:underline"
        >
        Kích hoạt tài khoản
        </button>
      </p>
    </div>
  );
}
