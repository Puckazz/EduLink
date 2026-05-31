'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import {
  LayoutDashboard,
  Users,
  User,
  UserRound,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  ClipboardCheck,
  Inbox,
  Link2,
  BookOpen,
  Calendar,
  MessageSquare,
  BellRing,
  CircleHelp,
  Bot,
  type LucideIcon,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useLogout } from '@/hooks/useLogout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useQuery } from '@tanstack/react-query';
import { NotificationService } from '@/services/notification.service';
import { useNotificationStatus } from '@/hooks/useNotificationStatus';
import type { Notification } from '@/types/notification';
import type { AuthProfile } from '@/types/auth';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  showUnread?: boolean;
};

const adminNavItems: NavItem[] = [
  { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { label: 'Sinh viên', href: '/admin/students', icon: Users },
  { label: 'Phụ huynh', href: '/admin/parents', icon: User },
  { label: 'Giảng viên', href: '/admin/teachers', icon: UserRound },
  { label: 'Liên kết PH - SV', href: '/admin/parent-links', icon: Link2 },
  { label: 'Chương trình đào tạo', href: '/admin/majors', icon: GraduationCap },
  { label: 'Quản lý điểm', href: '/admin/scores', icon: BarChart3 },
  { label: 'Điểm danh', href: '/admin/attendance', icon: ClipboardCheck },
  { label: 'Năm học & học kỳ', href: '/admin/academic-calendar', icon: Calendar },
  { label: 'Hộp thư phản hồi', href: '/admin/feedbacks', icon: Inbox },
  { label: 'Thông báo', href: '/admin/notifications', icon: BellRing, showUnread: true },
  { label: 'Câu hỏi thường gặp', href: '/admin/faq', icon: CircleHelp },
];

const parentNavItems: NavItem[] = [
  { label: 'Bảng điều khiển', href: '/parent', icon: LayoutDashboard },
  { label: 'Học tập', href: '/parent/scores', icon: BookOpen },
  { label: 'Điểm danh', href: '/parent/attendance', icon: ClipboardCheck },
  { label: 'Thời khóa biểu', href: '/parent/schedule', icon: Calendar },
  { label: 'Trò chuyện AI', href: '/parent/chat', icon: Bot },
  { label: 'Thông báo', href: '/parent/notifications', icon: BellRing, showUnread: true },
  { label: 'Tin nhắn', href: '/parent/feedback', icon: MessageSquare },
  { label: 'Hỏi đáp', href: '/parent/faq', icon: CircleHelp },
];

const teacherNavItems: NavItem[] = [
  { label: 'Bảng điều khiển', href: '/teacher', icon: LayoutDashboard },
  { label: 'Điểm danh', href: '/teacher/attendance', icon: ClipboardCheck },
  { label: 'Thời khóa biểu', href: '/teacher/schedule', icon: Calendar },
  { label: 'Thông báo', href: '/teacher/notifications', icon: BellRing, showUnread: true },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

function getNotificationScope(profile?: AuthProfile) {
  if (!profile) return undefined;
  if (profile.role === 'admin') return `admin:${profile.admin_id}`;
  if (profile.role === 'parent') return `parent:${profile.parent_id}`;
  return `teacher:${profile.teacher_id}`;
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();
  const { data: profile } = useCurrentUser();

  const [clickedHref, setClickedHref] = React.useState<string | null>(null);

  React.useEffect(() => {
    setClickedHref(null);
  }, [pathname]);

  const isParent = profile?.role === 'parent';
  const isTeacher = profile?.role === 'teacher';
  const isAdmin = profile?.role === 'admin';
  const notificationScope = getNotificationScope(profile);

  const navItems = isParent
    ? parentNavItems
    : isTeacher
      ? teacherNavItems
      : adminNavItems;

  const sidebarSubtitle = isParent
    ? 'Cổng Phụ huynh'
    : isTeacher
      ? 'Cổng Giảng viên'
      : 'Cổng Quản trị';

  const { data: rawNotifs = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', 'inbox', notificationScope],
    queryFn: async () => {
      if (isAdmin) {
        return NotificationService.getInbox();
      }
      return NotificationService.getMyNotifications();
    },
    enabled: !!profile,
    refetchInterval: 30_000,
  });

  const { readIds } = useNotificationStatus(notificationScope);
  const unreadCount = rawNotifs.filter(
    (n) => !readIds.includes(n.notification_id),
  ).length;

  const isActive = (href: string) => {
    if (clickedHref !== null) {
      return href === clickedHref;
    }

    if (isParent) {
      return href === '/parent'
        ? pathname === '/parent'
        : pathname.startsWith(href);
    }
    if (isTeacher) {
      return href === '/teacher'
        ? pathname === '/teacher'
        : pathname.startsWith(href);
    }
    return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
  };

  const isItemLoading = (href: string) => {
    if (clickedHref === null || clickedHref !== href) return false;

    const isSettings = href.endsWith('/settings');
    if (isSettings) {
      return !pathname.endsWith('/settings');
    }

    if (isParent) {
      return href === '/parent'
        ? pathname !== '/parent'
        : !pathname.startsWith(href);
    }
    if (isTeacher) {
      return href === '/teacher'
        ? pathname !== '/teacher'
        : !pathname.startsWith(href);
    }
    return href === '/admin' ? pathname !== '/admin' : !pathname.startsWith(href);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="bg-primary text-primary-foreground border-r-0"
      {...props}
    >
      <SidebarHeader className="border-b border-sidebar-border h-18 flex flex-row items-center gap-3 p-4 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
          <GraduationCap className="h-6 w-6 text-primary-foreground group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
        </div>
        <div className="flex flex-col min-w-0 font-sans group-data-[collapsible=icon]:hidden">
          <span className="text-sm font-bold leading-tight text-primary-foreground">
            EduLink
          </span>
          <span className="text-[11px] leading-tight text-primary-foreground/50">
            {sidebarSubtitle}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const badge = item.showUnread ? unreadCount : 0;
                const loading = isItemLoading(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-primary-foreground/60 hover:bg-primary-foreground/8 hover:text-primary-foreground data-[active=true]:bg-primary-foreground/15 data-[active=true]:text-primary-foreground font-medium h-10 [&>svg]:size-5 group-data-[collapsible=icon]:p-1.5! group-data-[collapsible=icon]:justify-center",
                        loading && "animate-pulse"
                      )}
                    >
                      <Link
                        href={item.href}
                        onClick={() => {
                          flushSync(() => {
                            setClickedHref(item.href);
                          });
                        }}
                      >
                        {loading ? (
                          <Spinner className="h-5 w-5 shrink-0 text-primary-foreground" />
                        ) : (
                          <item.icon className="h-5 w-5 shrink-0" />
                        )}
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>

                    {badge > 0 && (
                      <SidebarMenuBadge className="group-data-[collapsible=icon]:hidden text-[10px] bg-red-500 text-white rounded-full px-1.5 min-w-4 h-4 right-2 !top-1/2 !-translate-y-1/2 pointer-events-none flex items-center justify-center">
                        {badge > 99 ? '99+' : badge}
                      </SidebarMenuBadge>
                    )}

                    {badge > 0 && (
                      <span className="absolute hidden group-data-[collapsible=icon]:block h-2 w-2 right-1.5 top-1.5 rounded-full bg-red-500 pointer-events-none z-10" />
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            {(() => {
              const settingsHref = isParent
                ? '/parent/settings'
                : isTeacher
                  ? '/teacher/settings'
                  : '/admin/settings';
              const settingsLoading = isItemLoading(settingsHref);
              return (
                <SidebarMenuButton
                  asChild
                  isActive={isActive(settingsHref)}
                  tooltip="Cài đặt"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-primary-foreground/60 hover:bg-primary-foreground/8 hover:text-primary-foreground data-[active=true]:bg-primary-foreground/15 data-[active=true]:text-primary-foreground font-medium h-10 [&>svg]:size-5 group-data-[collapsible=icon]:p-1.5! group-data-[collapsible=icon]:justify-center",
                    settingsLoading && "animate-pulse"
                  )}
                >
                  <Link
                    href={settingsHref}
                    onClick={() => {
                      flushSync(() => {
                        setClickedHref(settingsHref);
                      });
                    }}
                  >
                    {settingsLoading ? (
                      <Spinner className="h-5 w-5 shrink-0 text-primary-foreground" />
                    ) : (
                      <Settings className="h-5 w-5 shrink-0" />
                    )}
                    <span className="group-data-[collapsible=icon]:hidden">
                      Cài đặt
                    </span>
                  </Link>
                </SidebarMenuButton>
              );
            })()}
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Đăng xuất"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-red-500 hover:bg-red-500/10 hover:text-red-500 data-[active=true]:bg-transparent h-10 [&>svg]:size-5 group-data-[collapsible=icon]:p-1.5! group-data-[collapsible=icon]:justify-center"
            >
              <button onClick={logout} disabled={isLoggingOut}>
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Đăng xuất
                </span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
