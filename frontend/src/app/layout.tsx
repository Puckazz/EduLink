import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { success } from 'zod';

const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin', 'vietnamese'],
});

export const metadata: Metadata = {
  title: 'EduLink',
  description: 'Nền tảng liên lạc giữa nhà trường và phụ huynh',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${lexend.variable} font-(family-name:--font-lexend) antialiased`}
      >
        {children}
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            classNames: {
              success: 'border border-green-200! bg-green-50! text-green-700!',
            },
          }}
        />
      </body>
    </html>
  );
}
