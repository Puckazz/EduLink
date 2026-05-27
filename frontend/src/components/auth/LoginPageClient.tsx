'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { LoginStep } from '@/components/auth/LoginStep';
import { ActivationStep } from '@/components/auth/ActivationStep';
import { OtpStep } from '@/components/auth/OtpStep';
import { SetPasswordStep } from '@/components/auth/SetPasswordStep';
import { ForgotPasswordStep } from '@/components/auth/ForgotPasswordStep';
import { AuthHeroPanel } from '@/components/auth/AuthHeroPanel';
import type { AuthStep, LoginResponse } from '@/types/auth';

export function LoginPageClient() {
  const [step, setStep] = useState<AuthStep>('login');
  const [phone, setPhone] = useState('');
  const [studentCode, setStudentCode] = useState('');

  const handleLoginSuccess = (response: LoginResponse) => {
    if (response.user.role === 'admin') {
      window.location.href = '/admin';
    } else if (response.user.role === 'teacher') {
      window.location.href = '/teacher';
    } else {
      window.location.href = '/parent';
    }
  };

  const handleOtpSent = (phoneNumber: string) => {
    setPhone(phoneNumber);
    setStep('otp');
  };

  const handleOtpVerified = () => {
    setStep('set-password');
  };

  const handlePasswordSet = () => {
    toast.success(
      'Tài khoản đã được kích hoạt thành công! Vui lòng đăng nhập.',
    );
    setStep('login');
  };

  return (
    <div className="flex w-full min-h-140 flex-col-reverse overflow-hidden rounded-2xl bg-card shadow-2xl lg:flex-row">
      <div className="relative flex flex-1 flex-col justify-center px-8 py-8 sm:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-90">
          {step === 'login' && (
            <LoginStep
              onSuccess={handleLoginSuccess}
              onSwitchToActivation={() => {
                setStep('activation');
              }}
              onSwitchToForgotPassword={() => {
                setStep('forgot-password');
              }}
            />
          )}

          {step === 'forgot-password' && (
            <ForgotPasswordStep
              onBackToLogin={() => setStep('login')}
              onSuccess={(message) => {
                toast.success(
                  message || 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.',
                  {
                    style: {
                      background: 'white',
                    },
                  },
                );
                setStep('login');
              }}
            />
          )}

          {step === 'activation' && (
            <ActivationStep
              onOtpSent={(phoneNumber, code) => {
                setStudentCode(code);
                handleOtpSent(phoneNumber);
              }}
              onBackToLogin={() => setStep('login')}
            />
          )}

          {step === 'otp' && (
            <OtpStep
              phone={phone}
              studentCode={studentCode}
              onVerified={handleOtpVerified}
              onBackToActivation={() => setStep('activation')}
            />
          )}

          {step === 'set-password' && (
            <SetPasswordStep phone={phone} onComplete={handlePasswordSet} />
          )}
        </div>
      </div>

      <AuthHeroPanel step={step} />
    </div>
  );
}
