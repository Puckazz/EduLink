import Link from 'next/link';
import { Bell, MoreHorizontal, ChevronRight } from 'lucide-react';

interface Notification {
  id?: number;
  title: string;
  content: string;
  created_at?: string;
  type?: string;
}

interface NotificationsWidgetProps {
  notifications: Notification[];
  isLoading?: boolean;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return 'Vừa xong';
}

const DOT_CLASSES = [
  'bg-red-500',
  'bg-slate-300',
  'bg-blue-400',
];

export function NotificationsWidget({ notifications, isLoading }: NotificationsWidgetProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Bell className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold text-slate-900">Thông báo mới</span>
        </div>
        <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 divide-y divide-slate-50">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Không có thông báo mới.</p>
        ) : (
          notifications.slice(0, 3).map((notif, idx) => (
            <div
              key={notif.id ?? idx}
              className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT_CLASSES[idx % DOT_CLASSES.length]}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 leading-snug">
                  {notif.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {notif.content}
                </p>
                {notif.created_at && (
                  <p className="mt-1 text-[11px] text-slate-400">{timeAgo(notif.created_at)}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-50 px-5 py-3.5">
        <Link
          href="/parent/notifications"
          className="flex items-center justify-center gap-1 text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors"
        >
          Xem tất cả thông báo <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
