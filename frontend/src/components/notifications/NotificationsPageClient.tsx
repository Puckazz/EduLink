'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Clock,
  Globe,
  GraduationCap,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Inbox,
  MessageSquare,
  Link as LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationService } from '@/services/notification.service';
import type { Notification } from '@/types/notification';
import { NotificationsFilterBar } from './NotificationsFilterBar';
import { NotificationDialog } from './NotificationDialog';
import { PaginationBar } from '@/components/shared/PaginationBar';
import Link from 'next/link';

type SortOrder = 'newest' | 'oldest';
const PAGE_SIZE = 10;

function RecipientBadge({ recipient }: { recipient: string }) {
  if (recipient === 'all') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Globe className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
        </span>
        Toàn trường
      </span>
    );
  }
  if (recipient === 'parents') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        </span>
        Phụ huynh
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
        <GraduationCap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      </span>
      Giáo viên
    </span>
  );
}

// ── Inbox Tab — thông báo nhận được từ feedback ─────────────────────────────
function InboxTab() {
  const { data: inbox = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['admin-notifications-inbox'],
    queryFn: NotificationService.getInbox,
    refetchInterval: 30_000, // Poll every 30s
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Thông báo nhận được
          </span>
          {inbox.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {inbox.length}
            </span>
          )}
        </div>
        <Link
          href="/admin/feedbacks"
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Quản lý hộp thư phản hồi
          <LinkIcon className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Nội dung
              </th>
              <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Thời gian
              </th>
              <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Đang tải...
                </td>
              </tr>
            ) : inbox.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Inbox className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Chưa có thông báo nào từ phụ huynh.</p>
                  </div>
                </td>
              </tr>
            ) : (
              inbox.map((item, idx) => {
                const { date, time } = formatDate(item.created_at);
                return (
                  <tr
                    key={item.notification_id}
                    className={`group transition-colors hover:bg-muted/50 ${
                      idx < inbox.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <td className="px-0 py-0 w-full">
                      <div className="flex h-full items-stretch">
                        <div className="w-1 shrink-0 bg-blue-400" />
                        <div className="flex flex-col justify-center gap-0.5 px-5 py-4">
                          <span className="font-medium text-foreground text-sm">{item.title}</span>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.content}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{date}<span className="ml-2">{time}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {item.feedback_id ? (
                        <Link
                          href="/admin/feedbacks"
                          className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Xem phản hồi
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function NotificationsPageClient() {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Notification | null>(null);
  const [activeTab, setActiveTab] = useState('sent');

  // Filters state
  const [search, setSearch] = useState('');
  const [recipient, setRecipient] = useState('all_types');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Queries & Mutations
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['admin-notifications'],
    queryFn: NotificationService.getAll,
  });

  // Inbox count for badge
  const { data: inbox = [] } = useQuery<Notification[]>({
    queryKey: ['admin-notifications-inbox'],
    queryFn: NotificationService.getInbox,
    refetchInterval: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => NotificationService.delete(id),
    onSuccess: () => {
      toast.success('Đã xóa thông báo');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa thông báo');
    },
  });

  // Derived state
  const filteredNotifications = useMemo(() => {
    const result = notifications.filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [notifications, search, sortOrder]);

  const totalItems = filteredNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredNotifications.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredNotifications]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleEdit = (item: Notification) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleClearFilters = () => {
    setSearch('');
    setRecipient('all_types');
    setSortOrder('newest');
    setCurrentPage(1);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản Lý Thông Báo
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tạo và quản lý các thông báo gửi đến giáo viên và phụ huynh toàn trường.
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList variant="line">
            <TabsTrigger value="sent">
              Thông báo đã gửi
            </TabsTrigger>
            <TabsTrigger value="inbox" className="relative">
              Hộp thư đến
              {inbox.length > 0 && (
                <span className="ml-2 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                  {inbox.length > 99 ? '99+' : inbox.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {activeTab === 'sent' && (
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo Thông Báo Mới
            </Button>
          )}
        </div>

        {/* ── Tab: Thông báo đã gửi ── */}
        <TabsContent value="sent" className="space-y-4 mt-4">
          <NotificationsFilterBar
            searchKeyword={search}
            selectedRecipient={recipient}
            sortOrder={sortOrder}
            onSearchKeywordChange={setSearch}
            onRecipientChange={setRecipient}
            onSortOrderChange={setSortOrder}
            onClearFilters={handleClearFilters}
          />

          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      Ngày gửi
                    </th>
                    <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      Đối tượng nhận
                    </th>
                    <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground pr-6 w-20 whitespace-nowrap">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : paginatedNotifications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">
                        Không tìm thấy thông báo nào.
                      </td>
                    </tr>
                  ) : (
                    paginatedNotifications.map((item, idx) => {
                      const isItemUrgent = item.title.toLowerCase().includes('khẩn') || item.title.toLowerCase().includes('quan trọng');
                      const { date, time } = formatDate(item.created_at);

                      return (
                        <tr
                          key={item.notification_id}
                          className={`group cursor-pointer transition-colors hover:bg-muted/50 ${
                            idx < paginatedNotifications.length - 1 ? 'border-b border-border' : ''
                          }`}
                        >
                          <td className="px-0 py-0 w-full">
                            <div className="flex h-full items-stretch">
                              <div className={`w-1 shrink-0 ${isItemUrgent ? 'bg-destructive' : 'bg-transparent'}`} />
                              <div className="flex flex-col justify-center gap-0.5 px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground text-sm">
                                    {item.title}
                                  </span>
                                  {isItemUrgent && (
                                    <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive whitespace-nowrap">
                                      Khẩn cấp
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-snug line-clamp-1 mt-1">
                                  {item.content}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                {date}
                                <span className="ml-2">{time}</span>
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex justify-end">
                              <RecipientBadge recipient={item.target_role === 'parent' ? 'parents' : item.target_role === 'teacher' ? 'teachers' : 'all'} />
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right pr-6 whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                  <span className="sr-only">Mở menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
                                      deleteMutation.mutate(item.notification_id);
                                    }
                                  }}
                                  className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Xóa</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="border-t border-border p-4">
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={PAGE_SIZE}
                  isBusy={isLoading}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── Tab: Hộp thư đến ── */}
        <TabsContent value="inbox" className="mt-4">
          <InboxTab />
        </TabsContent>
      </Tabs>

      <NotificationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingItem={editingItem}
      />
    </div>
  );
}
