'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginStep } from '@/components/auth/LoginStep';
import { ActivationStep } from '@/components/auth/ActivationStep';
import { OtpStep } from '@/components/auth/OtpStep';
import { SetPasswordStep } from '@/components/auth/SetPasswordStep';
import { AuthHeroPanel } from '@/components/auth/AuthHeroPanel';
import type { AuthStep, LoginResponse } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('login');
  const [phone, setPhone] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSuccess = (response: LoginResponse) => {
    localStorage.setItem('access_token', response.accessToken);

    if (response.user.role === 'admin') {
      router.push('/admin/students');
    } else {
      router.push('/parent/scores');
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
    setSuccessMessage(
      'Tài khoản đã được kích hoạt thành công! Vui lòng đăng nhập.',
    );
    setStep('login');
  };

  return (
    <div className="w-full max-w-4xl">
      {successMessage && step === 'login' && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          {step === 'login' && (
            <LoginStep
              onSuccess={handleLoginSuccess}
              onSwitchToActivation={() => {
                setSuccessMessage('');
                setStep('activation');
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

        <AuthHeroPanel step={step} />
      </div>
    </div>
  );
}
