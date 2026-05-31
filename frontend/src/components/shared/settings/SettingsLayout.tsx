'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface SettingsSection {
  id: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

export function SettingsLayout({ sections }: { sections: SettingsSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  return (
    <div className="flex overflow-hidden rounded-xl border border-border bg-card shadow-xs min-h-[580px]">
      {/* ── Left sidebar nav ── */}
      <aside className="w-56 shrink-0 border-r border-border px-3 py-4">
        <ul className="space-y-2">
          {sections.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => setActiveId(id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors text-left',
                  activeId === id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground font-medium hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ── Right content panel ── */}
      <div className="flex-1 min-w-0">{active?.content}</div>
    </div>
  );
}
