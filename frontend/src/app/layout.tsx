import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import './globals.css';

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
        className={`${lexend.variable} font-[family-name:var(--font-lexend)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
