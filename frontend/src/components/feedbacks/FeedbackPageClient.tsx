'use client';

import { useState, useEffect } from 'react';
import { FeedbackListSidebar } from './FeedbackListSidebar';
import type { SortByOption, SortOrderOption } from './FeedbackListSidebar';
import { FeedbackDetailPane } from './FeedbackDetailPane';
import { FeedbackAnalyticsModal } from './FeedbackAnalyticsModal';
import { AiFeedbackSummaryBanner } from './AiFeedbackSummaryBanner';
import { Search, ChevronLeft, ChevronRight, BarChart2, Download, Loader2, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFeedbacks } from '@/hooks/queries/useFeedbacks';
import { useFeedbackStats } from '@/hooks/queries/useFeedbackStats';
import { useDebounce } from '@/hooks/useDebounce';
import type { FeedbackStatus, FeedbackCategory } from '@/types/feedback';
import { exportFeedbackToExcel } from '@/lib/exportFeedback';

const PAGE_SIZE = 20;

export function FeedbackPageClient() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');
  const [selectedId, setSelectedId] = useState<number | null>(initialId ? parseInt(initialId) : null);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortByOption>('updated_at');
  const [sortOrder, setSortOrder] = useState<SortOrderOption>('desc');
  const [searchRaw, setSearchRaw] = useState('');
  const [page, setPage] = useState(1);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const search = useDebounce(searchRaw, 400);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSelectedId(parseInt(id));
  }, [searchParams]);

  function handleStatusChange(v: FeedbackStatus | 'ALL') {
    setStatusFilter(v);
    setPage(1);
    setSelectedId(null);
  }
  function handleCategoryChange(v: FeedbackCategory | 'ALL') {
    setCategoryFilter(v);
    setPage(1);
    setSelectedId(null);
  }
  function handleSortChange(newSortBy: SortByOption, newSortOrder: SortOrderOption) {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  }
  function handleSearchChange(v: string) {
    setSearchRaw(v);
    setPage(1);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportFeedbackToExcel({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        search: search || undefined,
      });
    } finally {
      setExporting(false);
    }
  }

  const { data, isLoading } = useFeedbacks({
    status: statusFilter,
    category: categoryFilter,
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
    sortBy,
    sortOrder,
  });

  const { data: stats } = useFeedbackStats();

  const feedbacks = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const selectedFeedback = feedbacks.find((fb) => fb.feedback_id === selectedId) ?? null;

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-0 w-full flex-col gap-6 overflow-hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Hộp Thư Phản Hồi
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Theo dõi, phân loại và giải đáp thắc mắc từ phụ huynh và học sinh.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={aiSummaryOpen ? 'default' : 'outline'}
            size="sm"
            className="gap-2 font-semibold"
            onClick={() => setAiSummaryOpen((v) => !v)}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">
              {aiSummaryOpen ? 'Ẩn tóm tắt AI' : 'Tóm tắt AI'}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-semibold"
            onClick={() => setAnalyticsOpen(true)}
          >
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Thống kê</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-semibold"
            disabled={exporting}
            onClick={handleExport}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Xuất Excel</span>
          </Button>
        </div>
      </div>

      {aiSummaryOpen && (
        <AiFeedbackSummaryBanner
          status={statusFilter}
          category={categoryFilter}
          search={search || undefined}
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-card shrink-0">
          <div className="relative w-full max-w-sm ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm phản hồi..."
              value={searchRaw}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative bg-card">
          <div
            className={`absolute inset-0 lg:relative lg:flex lg:w-1/2 z-10 transition-transform bg-card flex flex-col border-r border-border ${
              selectedId ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
            }`}
          >
            <FeedbackListSidebar
              feedbacks={feedbacks}
              selectedId={selectedId}
              onSelect={setSelectedId}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusChange}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={handleCategoryChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              stats={stats}
              isLoading={isLoading}
            />

            {!isLoading && totalPages > 1 && (
              <div className="shrink-0 border-t border-border px-4 py-3 flex items-center justify-between bg-card">
                <span className="text-xs text-muted-foreground font-medium">
                  {total} phản hồi · Trang {page}/{totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const pageNum = start + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'ghost'}
                        size="icon"
                        className={`h-8 w-8 text-xs font-bold ${
                          pageNum === page
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {!isLoading && total > 0 && totalPages === 1 && (
              <div className="shrink-0 border-t border-border px-4 py-3 bg-card">
                <span className="text-xs text-muted-foreground font-medium">{total} phản hồi</span>
              </div>
            )}
          </div>

          <div
            className={`absolute inset-0 lg:relative lg:w-1/2 flex flex-col z-20 bg-background transition-transform ${
              selectedId ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            }`}
          >
            <FeedbackDetailPane
              feedback={selectedFeedback}
              onDeleted={() => setSelectedId(null)}
            />

            {selectedId && (
              <button
                className="lg:hidden absolute top-4 left-4 p-2 bg-card rounded-full shadow-md z-50 text-foreground"
                onClick={() => setSelectedId(null)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <FeedbackAnalyticsModal
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        activeFilters={{
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          search: search || undefined,
        }}
      />
    </div>
  );
}
