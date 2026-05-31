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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface LoginStepProps {
  onSuccess: (response: LoginResponse) => void;
  onSwitchToActivation: () => void;
  onSwitchToForgotPassword: () => void;
}

function getResponseMessage(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const message = (data as { message?: unknown }).message;

  if (Array.isArray(message)) {
    return message.filter(Boolean).join('\n');
  }

  return typeof message === 'string' ? message : '';
}

function getLoginErrorMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
  }

  if (err.code === 'ECONNABORTED') {
    return 'Máy chủ phản hồi quá lâu. Vui lòng thử lại sau.';
  }

  if (!err.response) {
    return 'Không kết nối được đến máy chủ. Vui lòng kiểm tra backend hoặc kết nối mạng.';
  }

  const status = err.response.status;
  const message = getResponseMessage(err.response.data);

  if (status === 401) {
    return message || 'Tài khoản hoặc mật khẩu không đúng.';
  }

  if (status === 400 || status === 403) {
    return message || 'Yêu cầu đăng nhập không hợp lệ.';
  }

  if (status === 404) {
    return message || 'Không tìm thấy API đăng nhập. Vui lòng kiểm tra cấu hình máy chủ.';
  }

  if (status >= 500) {
    return message
      ? `Lỗi máy chủ: ${message}`
      : 'Máy chủ đang gặp lỗi. Vui lòng kiểm tra log backend và thử lại.';
  }

  return message || `Không thể đăng nhập. Mã lỗi HTTP ${status}.`;
}

function shouldSwitchToActivation(message: string): boolean {
  return (
    message.includes('chưa được kích hoạt') ||
    message.includes('chưa đặt mật khẩu') ||
    message.includes('hoàn tất quy trình kích hoạt')
  );
}

export function LoginStep({
  onSuccess,
  onSwitchToActivation,
  onSwitchToForgotPassword,
}: LoginStepProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await AuthService.login({ identifier, password });
      onSuccess(response);
    } catch (err: unknown) {
      const message = getLoginErrorMessage(err);

      setError(message);
      if (shouldSwitchToActivation(message)) {
        setTimeout(() => onSwitchToActivation(), 1500);
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
          <UserCircle2 className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          Cổng Đăng Nhập
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đăng nhập để quản lý hồ sơ học tập và liên lạc.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="login"
            className="text-xs font-bold uppercase tracking-wide text-primary"
          >
            Tên đăng nhập hoặc Số điện thoại
          </Label>
          <Input
            id="identifier"
            name="username"
            autoComplete="username"
            spellCheck={false}
            placeholder="Nhập tên đăng nhập hoặc Số điện thoại"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wide text-primary"
            >
              Mật khẩu
            </Label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
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

        {error ? (
          <p className="text-sm font-medium text-destructive">{error}</p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2 font-bold text-base h-12"
          disabled={loading || !identifier || !password}
        >
          {loading ? <Spinner className="size-6" /> : 'Đăng nhập'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToActivation}
          className="font-bold text-primary hover:underline"
        >
          Kích hoạt tài khoản
        </button>
      </p>

      <div className="mt-5 flex justify-center">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
              <UserCircle2 className="mr-2 h-4 w-4" />
              Xem tài khoản dùng thử
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" className="w-80 p-4 shadow-xl border-primary/10 rounded-xl">
            <p className="text-xs font-bold text-primary mb-3 uppercase tracking-wider text-center">Tài khoản dùng thử</p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between items-center bg-primary/5 p-2.5 rounded-lg border border-primary/10">
                <div className="flex flex-col">
                  <span className="font-semibold text-primary text-xs">Admin</span>
                  <span className="font-mono text-muted-foreground text-[11px]">admin / admin123</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-3 bg-white"
                  onClick={() => {
                    setIdentifier('admin');
                    setPassword('admin123');
                    setIsPopoverOpen(false);
                  }}
                >
                  Chọn
                </Button>
              </div>
              
              <div className="flex justify-between items-center bg-primary/5 p-2.5 rounded-lg border border-primary/10">
                <div className="flex flex-col">
                  <span className="font-semibold text-primary text-xs">Phụ huynh</span>
                  <span className="font-mono text-muted-foreground text-[11px]">0912233445 / 123456</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-3 bg-white"
                  onClick={() => {
                    setIdentifier('0912233445');
                    setPassword('123456');
                    setIsPopoverOpen(false);
                  }}
                >
                  Chọn
                </Button>
              </div>

              <div className="flex justify-between items-center bg-primary/5 p-2.5 rounded-lg border border-primary/10">
                <div className="flex flex-col">
                  <span className="font-semibold text-primary text-xs">Giáo viên</span>
                  <span className="font-mono text-muted-foreground text-[11px]">teacher1 / teacher123</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-3 bg-white"
                  onClick={() => {
                    setIdentifier('teacher1');
                    setPassword('teacher123');
                    setIsPopoverOpen(false);
                  }}
                >
                  Chọn
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
