'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { Header } from '@/components/shared/Header';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChatWidget } from '@/components/parent/chat/ChatWidget';

export function DashboardLayoutClient({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background">
          <Header />
          <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
      <ChatWidget />
    </TooltipProvider>
  );
}

