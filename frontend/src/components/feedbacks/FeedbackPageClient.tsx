'use client';

import { useState, useEffect } from 'react';
import { FeedbackListSidebar } from './FeedbackListSidebar';
import { FeedbackDetailPane } from './FeedbackDetailPane';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFeedbacks } from '@/hooks/queries/useFeedbacks';
import { useDebounce } from '@/hooks/useDebounce';
import type { FeedbackStatus } from '@/types/feedback';

const PAGE_SIZE = 20;

export function FeedbackPageClient() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');
  const [selectedId, setSelectedId] = useState<number | null>(initialId ? parseInt(initialId) : null);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'ALL'>('ALL');
  const [searchRaw, setSearchRaw] = useState('');
  const [page, setPage] = useState(1);
  const search = useDebounce(searchRaw, 400);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedId(parseInt(id));
    }
  }, [searchParams]);

  // Reset to page 1 when filters change
  function handleStatusChange(v: FeedbackStatus | 'ALL') {
    setStatusFilter(v);
    setPage(1);
    setSelectedId(null);
  }
  function handleSearchChange(v: string) {
    setSearchRaw(v);
    setPage(1);
  }

  const { data, isLoading } = useFeedbacks({
    status: statusFilter,
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const feedbacks = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const selectedFeedback = feedbacks.find((fb) => fb.feedback_id === selectedId) ?? null;

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Hộp Thư Phản Hồi
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Theo dõi, phân loại và giải đáp thắc mắc từ phụ huynh và học sinh.
          </p>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-14rem)] rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Top Search bar */}
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

        {/* Main Split Pane */}
        <div className="flex flex-1 overflow-hidden relative bg-card">
          {/* Left Side: List */}
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
              isLoading={isLoading}
            />

            {/* Pagination Controls */}
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

                  {/* Page number buttons */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
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

            {/* Total count khi chỉ có 1 trang */}
            {!isLoading && total > 0 && totalPages === 1 && (
              <div className="shrink-0 border-t border-border px-4 py-3 bg-card">
                <span className="text-xs text-muted-foreground font-medium">{total} phản hồi</span>
              </div>
            )}
          </div>

          {/* Right Side: Detail */}
          <div
            className={`absolute inset-0 lg:relative lg:w-1/2 flex flex-col z-20 bg-background transition-transform ${
              selectedId ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            }`}
          >
            <FeedbackDetailPane feedback={selectedFeedback} />

            {/* Mobile Back Button */}
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
    </div>
  );
}
