'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ClipboardCheck,
  Inbox,
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

const mainNavItems = [
  { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { label: 'Sinh viên', href: '/admin/students', icon: Users },
  { label: 'Giảng viên', href: '/admin/teachers', icon: GraduationCap },
  { label: 'Quản lý điểm', href: '/admin/scores', icon: BarChart3 },
  { label: 'Điểm danh', href: '/admin/attendance', icon: ClipboardCheck },
  { label: 'Thời khóa biểu', href: '/admin/schedule', icon: CalendarDays },
  { label: 'Hộp thư phản hồi', href: '/admin/feedbacks', icon: Inbox, badge: 5 },
  { label: 'Báo cáo', href: '/admin/reports', icon: BarChart3 },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

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
            UniConnect
          </span>
          <span className="text-[11px] leading-tight text-primary-foreground/50">
            Cổng quản trị
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-primary-foreground/60 hover:bg-primary-foreground/8 hover:text-primary-foreground data-[active=true]:bg-primary-foreground/15 data-[active=true]:text-primary-foreground font-medium h-10 [&>svg]:size-5 group-data-[collapsible=icon]:p-1.5! group-data-[collapsible=icon]:justify-center"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge != null && (
                    <SidebarMenuBadge className="group-data-[collapsible=icon]:hidden text-[10px] bg-red-500 text-white rounded-full px-1.5 min-w-4 h-4 right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                  {/* Badge dot when collapsed */}
                  {item.badge != null && (
                    <span className="absolute hidden group-data-[collapsible=icon]:flex h-2 w-2 right-1.5 top-1.5 items-center justify-center rounded-full bg-red-500 pointer-events-none" />
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Cài đặt"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-primary-foreground/60 hover:bg-primary-foreground/8 hover:text-primary-foreground h-10 [&>svg]:size-5 group-data-[collapsible=icon]:p-1.5! group-data-[collapsible=icon]:justify-center"
            >
              <Link href="/admin/settings">
                <Settings className="h-5 w-5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Cài đặt
                </span>
              </Link>
            </SidebarMenuButton>
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
