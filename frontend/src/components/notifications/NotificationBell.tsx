'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Clock, Globe, GraduationCap, User, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// ──────────────────────────────────────────────
// Types & mock data
// ──────────────────────────────────────────────
interface DropdownNotif {
  id: number;
  title: string;
  preview: string;
  time: string;
  recipient: 'all' | 'parents' | 'students';
  isUrgent: boolean;
  isRead: boolean;
}

const INITIAL_NOTIFS: DropdownNotif[] = [
  {
    id: 1,
    title: 'Thông báo Khẩn: Đóng cửa khuôn viên trường',
    preview: 'Do điều kiện thời tiết diễn biến phức tạp...',
    time: '08:30 - 24/10/2023',
    recipient: 'all',
    isUrgent: true,
    isRead: false,
  },
  {
    id: 2,
    title: 'Đã có Bảng điểm Học kỳ',
    preview: 'Điểm tổng kết Học kỳ I đã được cập nhật...',
    time: '14:15 - 22/10/2023',
    recipient: 'parents',
    isUrgent: false,
    isRead: false,
  },
  {
    id: 3,
    title: 'Bảo trì hệ thống Thư viện',
    preview: 'Danh mục thư viện trực tuyến sẽ tạm ngưng...',
    time: '11:00 - 20/10/2023',
    recipient: 'students',
    isUrgent: false,
    isRead: true,
  },
  {
    id: 4,
    title: 'Cập nhật Quy định Y tế & An toàn',
    preview: 'Các quy định mới về phòng chống cúm mùa...',
    time: '09:45 - 18/10/2023',
    recipient: 'all',
    isUrgent: true,
    isRead: true,
  },
];

function RecipientIcon({ recipient }: { recipient: DropdownNotif['recipient'] }) {
  if (recipient === 'parents') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
        <User className="h-3 w-3 text-emerald-600" />
      </span>
    );
  }
  if (recipient === 'students') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
        <GraduationCap className="h-3 w-3 text-blue-600" />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
      <Globe className="h-3 w-3 text-slate-500" />
    </span>
  );
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<DropdownNotif[]>(INITIAL_NOTIFS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: number) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 focus:outline-none"
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white p-0 text-[9px] font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[450px] max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Bell className="h-5 w-5 text-slate-700 shrink-0" />
              <span className="text-base font-bold text-slate-900 whitespace-nowrap">Thông báo</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
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

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                <Bell className="h-8 w-8 text-slate-200" />
                <p className="text-sm text-slate-400">Không có thông báo nào.</p>
              </div>
            ) : (
              notifs.map((notif, idx) => (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={`group flex cursor-pointer gap-3 px-5 py-4 transition-colors hover:bg-slate-50 ${
                    idx < notifs.length - 1 ? 'border-b border-slate-100' : ''
                  } ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 flex w-5 shrink-0 justify-center">
                    {!notif.isRead ? (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    ) : (
                      <span className="h-2 w-2" />
                    )}
                  </div>

                  {/* Content */}
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
                      <span>·</span>
                      <RecipientIcon recipient={notif.recipient} />
                      <span>
                        {notif.recipient === 'all'
                          ? 'Tất cả'
                          : notif.recipient === 'parents'
                            ? 'Phụ huynh'
                            : 'Sinh viên'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-5 py-3">
            <Link
              href="/admin/notifications"
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
