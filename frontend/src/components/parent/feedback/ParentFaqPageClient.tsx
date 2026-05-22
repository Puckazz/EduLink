'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  HelpCircle,
  MessageSquarePlus,
  LifeBuoy,
} from 'lucide-react';
import { useFaqs } from '@/hooks/queries/useFaqs';
import type { Faq, FaqGroup } from '@/types/faq';
import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from '@/types/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

// ── Category Tab ─────────────────────────────────────────────────────────────
function CategoryNavItem({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 min-w-fit items-center justify-between rounded-md px-3 text-left text-sm font-semibold transition-colors lg:w-full ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span
        className={`ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
          active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ── FAQ Accordion Item ────────────────────────────────────────────────────────
function FaqAccordionRow({ item }: { item: Faq }) {
  return (
    <AccordionItem
      value={String(item.faq_id)}
      className="-mt-px border-y border-slate-200 first:mt-0 last:border-b"
    >
      <AccordionTrigger
        className="min-h-14 rounded-none px-0 py-4 text-left text-sm font-bold leading-snug text-slate-900 hover:no-underline"
      >
        {item.question}
      </AccordionTrigger>
      <AccordionContent className="pb-5 pr-8 text-sm leading-relaxed text-slate-600">
        <p className="whitespace-pre-line">{item.answer}</p>
      </AccordionContent>
    </AccordionItem>
  );
}

// ── FAQ Group ─────────────────────────────────────────────────────────────────
function FaqGroupSection({ group }: { group: FaqGroup }) {
  return (
    <section className="scroll-mt-6">
      <h2 className="mb-2 text-2xl font-bold text-slate-950">
        {group.label}
      </h2>
      <Accordion type="multiple" className="w-full">
        {group.items.map((item) => (
          <FaqAccordionRow key={item.faq_id} item={item} />
        ))}
      </Accordion>
    </section>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100">
        <HelpCircle className="h-7 w-7 text-slate-400" />
      </div>
      <p className="text-base font-semibold text-slate-700">
        {query ? `Không tìm thấy kết quả cho "${query}"` : 'Chưa có câu hỏi nào'}
      </p>
      <p className="text-sm text-slate-500 mt-1">
        {query ? 'Thử tìm kiếm với từ khóa khác.' : 'Hệ thống đang cập nhật nội dung.'}
      </p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function FaqSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      {[1, 2, 3].map((g) => (
        <div key={g}>
          <div className="mb-4 h-7 w-40 animate-pulse rounded bg-slate-100" />
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse border-b border-slate-100 bg-white" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ParentFaqPageClient() {
  const { data: faqs, isLoading } = useFaqs();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FeedbackCategory | 'ALL'>('ALL');

  // Build grouped FAQ list
  const allGroups = useMemo<FaqGroup[]>(() => {
    if (!faqs) return [];
    const map = new Map<FeedbackCategory, Faq[]>();
    for (const faq of faqs) {
      const existing = map.get(faq.category) ?? [];
      map.set(faq.category, [...existing, faq]);
    }
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      label: FEEDBACK_CATEGORY_LABELS[category],
      items,
    }));
  }, [faqs]);

  // Apply search + category filter
  const filteredGroups = useMemo<FaqGroup[]>(() => {
    const q = normalizeSearchText(searchQuery.trim());
    return allGroups
      .filter((g) => activeCategory === 'ALL' || g.category === activeCategory)
      .map((g) => ({
        ...g,
        items: q
          ? g.items.filter(
              (i) =>
                normalizeSearchText(i.question).includes(q) ||
                normalizeSearchText(i.answer).includes(q) ||
                normalizeSearchText(g.label).includes(q),
            )
          : g.items,
      }))
      .filter((g) => g.items.length > 0);
  }, [allGroups, searchQuery, activeCategory]);

  const totalCount = faqs?.length ?? 0;

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <section className="bg-[linear-gradient(120deg,#0b203c_0%,#16365d_52%,#2f6f7a_100%)] px-6 py-10 text-white sm:px-10 md:py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex h-8 items-center gap-2 rounded-md bg-white/12 px-3 text-xs font-semibold text-white/85 ring-1 ring-white/15">
              <LifeBuoy className="h-4 w-4" />
              Trung tâm hỗ trợ phụ huynh
            </div>
            <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">
              Câu hỏi thường gặp
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
              Tra cứu nhanh các hướng dẫn về điểm số, chuyên cần, lịch học, học phí và các kênh hỗ trợ từ nhà trường.
            </p>
          </div>
          <Button asChild variant="secondary" className="w-fit bg-white text-primary hover:bg-white/90">
            <Link href="/parent/feedback">
              <MessageSquarePlus className="h-4 w-4" />
              Gửi câu hỏi
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid min-h-140 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white px-4 py-4 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-4 lg:flex-col lg:overflow-visible lg:pb-0">
            <CategoryNavItem
              label="Tất cả"
              active={activeCategory === 'ALL'}
              count={totalCount}
              onClick={() => setActiveCategory('ALL')}
            />
            {allGroups.map((g) => (
              <CategoryNavItem
                key={g.category}
                label={g.label}
                active={activeCategory === g.category}
                count={g.items.length}
                onClick={() => setActiveCategory(g.category)}
              />
            ))}
          </div>
        </aside>

        <main className="px-5 py-6 sm:px-8 lg:px-10">
          <div className="relative mb-8 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-md bg-white pl-9 text-sm"
            />
          </div>

          {isLoading ? (
            <FaqSkeleton />
          ) : filteredGroups.length === 0 ? (
            <EmptyState query={searchQuery} />
          ) : (
            <div className="flex flex-col gap-12">
              {filteredGroups.map((group) => (
                <FaqGroupSection key={group.category} group={group} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
