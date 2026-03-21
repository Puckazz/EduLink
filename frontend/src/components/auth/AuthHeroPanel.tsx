import {
  ShieldCheck,
  LockKeyhole,
  GraduationCap,
  ShieldUser,
} from 'lucide-react';
import type { AuthStep } from '@/types/auth';

const heroContent: Record<
  AuthStep,
  { icon: React.ReactNode; title: string; description: string }
> = {
  login: {
    icon: <GraduationCap className="h-8 w-8 text-white" strokeWidth={1.5} />,
    title: 'Kết Nối Giáo Dục',
    description:
      'Nền tảng liên lạc giữa nhà trường và phụ huynh, hướng tới tương lai học tập tốt đẹp hơn.',
  },
  activation: {
    icon: <ShieldUser className="h-7 w-7 text-white" strokeWidth={1.5} />,
    title: 'Kích Hoạt Tài Khoản',
    description: 'Hoàn tất xác thực để truy cập thông tin học tập của con bạn.',
  },
  otp: {
    icon: <ShieldCheck className="h-10 w-10 text-white" strokeWidth={1.5} />,
    title: 'Xác Thực Bảo Mật',
    description:
      'Đảm bảo an toàn và bảo mật thông tin học tập thông qua xác thực bảo mật đa lớp.',
  },
  'set-password': {
    icon: <LockKeyhole className="h-10 w-10 text-white" strokeWidth={1.5} />,
    title: 'Thiết Lập Mật Khẩu',
    description:
      'Đặt mật khẩu đủ mạnh để bảo vệ tài khoản của bạn khỏi truy cập trái phép.',
  },
  'forgot-password': {
    icon: <LockKeyhole className="h-10 w-10 text-white" strokeWidth={1.5} />,
    title: 'Khôi Phục Mật Khẩu',
    description:
      'Xác thực bằng mã OTP để đặt lại mật khẩu và tiếp tục truy cập tài khoản của bạn.',
  },
};

export function AuthHeroPanel({ step }: { step: AuthStep }) {
  const { icon, title, description } = heroContent[step];

  return (
    <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-end overflow-hidden rounded-r-2xl px-16 py-24 text-white min-h-160">
      {/* Background Image Placeholder */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-primary/85" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-87.5">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
          {icon}
        </div>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight">{title}</h2>
        <p className="text-lg text-white/90 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}
