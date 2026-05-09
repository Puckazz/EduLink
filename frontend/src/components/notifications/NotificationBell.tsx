'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Clock, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useQuery } from '@tanstack/react-query';
import { NotificationService } from '@/services/notification.service';
import { useNotificationStatus } from '@/hooks/useNotificationStatus';

export function NotificationBell() {
  const { data: profile } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: rawNotifs = [] } = useQuery({
    queryKey: ['notifications', profile?.role, 'v2-debug'],
    queryFn: async () => {
      if (profile?.role === 'admin') {
        // For admin, we only show inbox (feedback notifications) in the popup
        const inbox = await NotificationService.getInbox();
        console.log('NotificationBell inbox data:', inbox);
        return [...inbox].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      }
      return NotificationService.getMyNotifications();
    },
    enabled: !!profile,
  });

  const { readIds, markAsRead, markAllAsRead } = useNotificationStatus();

  // Transform data
  const notifs = rawNotifs
    .map((n) => {
      const d = new Date(n.created_at);
      return {
        id: n.notification_id,
        title: n.title,
        preview: n.content,
        time: `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
        isUrgent:
          n.title.toLowerCase().includes('khẩn') ||
          n.title.toLowerCase().includes('quan trọng'),
        isRead: readIds.includes(n.notification_id),
      };
    })
    .slice(0, 10); // Show max 10 in dropdown

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkAllRead = () => {
    markAllAsRead(notifs.map((n) => n.id));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 focus:outline-none"
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute right-2.5 top-2.5 flex h-4.5 w-4.5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white p-0 text-[9px] font-bold leading-none"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-112.5 max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Bell className="h-5 w-5 text-slate-700 shrink-0" />
              <span className="text-base font-bold text-slate-900 whitespace-nowrap">
                Thông báo
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="ml-1 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                <Bell className="h-8 w-8 text-slate-200" />
                <p className="text-sm text-slate-400">
                  Không có thông báo nào.
                </p>
              </div>
            ) : (
              notifs.map((notif, idx) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`group flex cursor-pointer gap-3 px-5 py-4 transition-colors hover:bg-slate-50 ${
                    idx < notifs.length - 1 ? 'border-b border-slate-100' : ''
                  } ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
                >
                  <div className="mt-1.5 flex w-5 shrink-0 justify-center">
                    {!notif.isRead ? (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    ) : (
                      <span className="h-2 w-2" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p
                      className={`text-sm leading-snug ${!notif.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}
                    >
                      {notif.title}
                    </p>

                    {notif.isUrgent && (
                      <div className="flex">
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600 border border-red-100">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Khẩn cấp
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {notif.preview}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{notif.time}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-5 py-3">
            <Link
              href={
                profile?.role === 'admin'
                  ? '/admin/notifications'
                  : `/${profile?.role || 'parent'}/notifications`
              }
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Xem tất cả thông báo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
