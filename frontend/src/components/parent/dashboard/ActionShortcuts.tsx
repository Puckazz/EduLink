import Link from 'next/link';
import { CreditCard, Calendar, ShieldPlus, ArrowRight } from 'lucide-react';

const shortcuts = [
  {
    icon: CreditCard,
    title: 'Thanh toán',
    desc: 'Học phí, ký túc xá và các khoản phí khác.',
    action: 'Thanh toán ngay',
    href: '/parent/finance',
    dark: true,
  },
  {
    icon: Calendar,
    title: 'Lịch học vụ',
    desc: 'Các mốc thời gian quan trọng và ngày nghỉ.',
    action: null,
    href: '/parent/attendance',
    dark: false,
  },
  {
    icon: ShieldPlus,
    title: 'Dịch vụ Y tế',
    desc: 'Bảo hiểm và đặt lịch khám.',
    action: null,
    href: '#',
    dark: false,
  },
];

export function ActionShortcuts() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {shortcuts.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className={`group flex flex-col justify-between gap-5 rounded-2xl p-5 transition-all duration-200 ${
            item.dark
              ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800'
              : 'border border-slate-100 bg-white hover:shadow-sm hover:border-slate-200'
          }`}
        >
          {/* Icon */}
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              item.dark ? 'bg-white/10' : 'bg-slate-100 group-hover:bg-slate-200'
            } transition-colors`}
          >
            <item.icon
              className={`h-5 w-5 ${item.dark ? 'text-white' : 'text-slate-600'}`}
            />
          </div>

          {/* Text */}
          <div className="space-y-1">
            <p
              className={`text-sm font-bold ${
                item.dark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {item.title}
            </p>
            <p
              className={`text-xs leading-relaxed ${
                item.dark ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              {item.desc}
            </p>
          </div>

          {/* CTA */}
          {item.action && (
            <div
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                item.dark
                  ? 'text-slate-300 group-hover:text-white'
                  : 'text-slate-500 group-hover:text-slate-800'
              }`}
            >
              {item.action}
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
