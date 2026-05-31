import Link from 'next/link';
import { Calendar, CircleHelp, ArrowRight, MessageSquare } from 'lucide-react';

const shortcuts = [
  {
    icon: MessageSquare,
    title: 'Gửi phản hồi',
    desc: 'Trao đổi, góp ý với nhà trường.',
    action: 'Gửi ngay',
    href: '/parent/feedback',
    dark: true,
  },
  {
    icon: Calendar,
    title: 'Thời khóa biểu',
    desc: 'Lịch học và các sự kiện sắp tới.',
    action: 'Xem lịch',
    href: '/parent/schedule',
    dark: false,
  },
  {
    icon: CircleHelp,
    title: 'Hỏi đáp',
    desc: 'Xem câu hỏi thường gặp và hướng dẫn nhanh.',
    action: 'Xem ngay',
    href: '/parent/faq',
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
              ? 'border border-primary bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              item.dark ? 'bg-primary-foreground/10' : 'bg-slate-100 group-hover:bg-slate-200'
            } transition-colors`}
          >
            <item.icon
              className={`h-5 w-5 ${item.dark ? 'text-primary-foreground' : 'text-slate-600'}`}
            />
          </div>

          <div className="space-y-1">
            <p
              className={`text-sm font-bold ${
                item.dark ? 'text-primary-foreground' : 'text-primary'
              }`}
            >
              {item.title}
            </p>
            <p
              className={`text-xs leading-relaxed ${
                item.dark ? 'text-primary-foreground/75' : 'text-slate-500'
              }`}
            >
              {item.desc}
            </p>
          </div>

          {item.action && (
            <div
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                item.dark
                  ? 'text-primary-foreground/75 group-hover:text-primary-foreground'
                  : 'text-slate-500 group-hover:text-primary'
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
