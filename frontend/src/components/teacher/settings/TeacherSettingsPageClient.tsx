'use client';

import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { AtSign, BadgeCheck, KeyRound, Phone, UserRound } from 'lucide-react';
import { AuthService } from '@/services/auth.service';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import type { TeacherProfile } from '@/types/auth';

function getErrorMessage(error: unknown) {
  const apiError = error as { response?: { data?: { message?: unknown } } };
  const message = apiError.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? 'Đổi mật khẩu thất bại.';
  if (typeof message === 'string') return message;
  return 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function TeacherSettingsPageClient() {
  const { data: profile, isPending } = useCurrentUser();
  const teacher = profile?.role === 'teacher' ? (profile as TeacherProfile) : null;

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!oldPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới chưa khớp.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await AuthService.changePassword({
        oldPassword,
        newPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(result.message || 'Đã đổi mật khẩu thành công.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-lg" />
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cài đặt tài khoản</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem thông tin hồ sơ giảng viên và cập nhật mật khẩu đăng nhập.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Card className="rounded-lg shadow-xs">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="text-base">Hồ sơ giảng viên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <ProfileRow
              icon={BadgeCheck}
              label="Mã giảng viên"
              value={teacher ? `#${teacher.teacher_id}` : 'Không xác định'}
            />
            <ProfileRow
              icon={UserRound}
              label="Họ và tên"
              value={teacher?.full_name || 'Chưa cập nhật'}
            />
            <ProfileRow
              icon={UserRound}
              label="Tên đăng nhập"
              value={teacher?.username || 'Chưa cập nhật'}
            />
            <ProfileRow
              icon={AtSign}
              label="Email"
              value={teacher?.email || 'Chưa cập nhật'}
            />
            <ProfileRow
              icon={Phone}
              label="Số điện thoại"
              value={teacher?.phone || 'Chưa cập nhật'}
            />
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-xs">
          <CardHeader className="border-b border-border px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4" />
              Đổi mật khẩu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  autoComplete="current-password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Mật khẩu mới cần tối thiểu 6 ký tự.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
