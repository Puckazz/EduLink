import { GraduationCap, UserPlus, ShieldCheck, Lock } from 'lucide-react';
import type { AuthStep } from '@/types/auth';

const heroContent: Record<
  AuthStep,
  { icon: React.ReactNode; title: string; description: string }
> = {
  login: {
    icon: <GraduationCap className="h-10 w-10 text-white" strokeWidth={1.5} />,
    title: 'Kết Nối Giáo Dục',
    description:
      'Nền tảng liên lạc giữa nhà trường và phụ huynh, hướng tới tương lai học tập tốt đẹp hơn.',
  },
  activation: {
    icon: <UserPlus className="h-10 w-10 text-white" strokeWidth={1.5} />,
    title: 'Kích Hoạt Tài Khoản',
    description: 'Hoàn tất xác thực để truy cập thông tin học tập của con bạn.',
  },
  otp: {
    icon: <ShieldCheck className="h-10 w-10 text-white" strokeWidth={1.5} />,
    title: 'Xác Thực Bảo Mật',
    description:
      'Đảm bảo an toàn và bảo mật thông tin học tập thông qua xác thực đa yếu tố.',
  },
  'set-password': {
    icon: <Lock className="h-10 w-10 text-white" strokeWidth={1.5} />,
    title: 'Thiết Lập Bảo Mật',
    description:
      'Đặt mật khẩu để bảo vệ tài khoản và truy cập thông tin mọi lúc.',
  },
};

export function AuthHeroPanel({ step }: { step: AuthStep }) {
  const { icon, title, description } = heroContent[step];

  return (
    <div className="hidden lg:flex relative flex-col justify-end rounded-r-2xl bg-gradient-to-br from-blue-600 to-blue-900 p-10 text-white overflow-hidden min-h-[560px]">
      <div className="relative z-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
          {icon}
        </div>
        <h2 className="mb-3 text-3xl font-bold">{title}</h2>
        <p className="text-base text-blue-100 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
