'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Search, Clock, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NotificationService } from '@/services/notification.service';
import type { Notification } from '@/types/notification';
import { useNotificationStatus } from '@/hooks/useNotificationStatus';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { AuthProfile } from '@/types/auth';
import { formatDateParts } from '@/utils';

type SortOrder = 'newest' | 'oldest';
const PAGE_SIZE = 10;

function getNotificationScope(profile?: AuthProfile) {
  if (!profile) return undefined;
  if (profile.role === 'admin') return `admin:${profile.admin_id}`;
  if (profile.role === 'parent') return `parent:${profile.parent_id}`;
  return `teacher:${profile.teacher_id}`;
}

export function NotificationListPageClient() {
  const { data: profile } = useCurrentUser();
  const notificationScope = getNotificationScope(profile);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['my-notifications', notificationScope],
    queryFn: () => NotificationService.getMyNotifications(),
    enabled: !!profile,
  });

  const { readIds, markAsRead, markAllAsRead } = useNotificationStatus(notificationScope);

  const filteredNotifications = useMemo(() =>
    notifications
      .filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      }),
    [notifications, search, sortOrder],
  );

  const totalItems = filteredNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredNotifications.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredNotifications]);

  const unreadIds = filteredNotifications
    .filter((n) => !readIds.includes(n.notification_id))
    .map((n) => n.notification_id);

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Thông Báo Của Bạn
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cập nhật các tin tức và thông báo mới nhất từ nhà trường.
          </p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="notification-search"
            placeholder="Tìm kiếm thông báo..."
            className="pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">
            Tất cả thông báo
            <span className="ml-2 text-muted-foreground font-normal">
              ({totalItems})
            </span>
          </span>
          {unreadIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-semibold text-primary hover:text-primary"
              onClick={() => markAllAsRead(unreadIds)}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sắp xếp:</span>
          <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v as SortOrder); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 w-[130px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : paginatedNotifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {search ? 'Không tìm thấy thông báo phù hợp.' : 'Chưa có thông báo nào.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedNotifications.map((item) => {
              const { date, time } = formatDateParts(item.created_at);
              const isUrgent =
                item.title.toLowerCase().includes('khẩn') ||
                item.title.toLowerCase().includes('quan trọng');
              const isRead = readIds.includes(item.notification_id);

              return (
                <div
                  key={item.notification_id}
                  onClick={() => markAsRead(item.notification_id)}
                  className={`group relative flex gap-4 p-5 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="mt-2.5 flex w-2 shrink-0 justify-center">
                    {!isRead ? (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    ) : (
                      <span className="h-2 w-2" />
                    )}
                  </div>

                  <div className="mt-1 shrink-0">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isUrgent ? 'bg-destructive/10' : 'bg-muted'
                      }`}
                    >
                      <Bell
                        className={`h-5 w-5 ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm ${
                            !isRead
                              ? 'font-bold text-foreground'
                              : 'font-semibold text-foreground/80'
                          }`}
                        >
                          {item.title}
                        </h3>
                        {isUrgent && (
                          <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive whitespace-nowrap">
                            Khẩn cấp
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" />
                        <span>{time} · {date}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Người gửi: {item.admin?.full_name || 'Nhà trường'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            isBusy={isLoading}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </div>
  );
}
