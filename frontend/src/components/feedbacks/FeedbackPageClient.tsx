'use client';

import { useState } from 'react';
import { FeedbackListSidebar } from './FeedbackListSidebar';
import { FeedbackDetailPane } from './FeedbackDetailPane';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFeedbacks } from '@/hooks/queries/useFeedbacks';
import { useDebounce } from '@/hooks/useDebounce';
import type { FeedbackStatus } from '@/types/feedback';

const PAGE_SIZE = 20;

export function FeedbackPageClient() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'ALL'>('ALL');
  const [searchRaw, setSearchRaw] = useState('');
  const [page, setPage] = useState(1);
  const search = useDebounce(searchRaw, 400);

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
    <div>
      <div className="flex flex-col h-[calc(100vh-8rem)] rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Top Search bar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-200 bg-white shrink-0">
          <div className="relative w-full max-w-sm ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm phản hồi..."
              value={searchRaw}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-10 border-slate-200 focus-visible:ring-slate-300 bg-slate-50 font-medium shadow-none"
            />
          </div>
        </div>

        {/* Main Split Pane */}
        <div className="flex flex-1 overflow-hidden relative bg-white">
          {/* Left Side: List */}
          <div
            className={`absolute inset-0 lg:relative lg:flex lg:w-1/2 z-10 transition-transform bg-white flex flex-col ${
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
              <div className="shrink-0 border-t border-slate-200 px-4 py-3 flex items-center justify-between bg-white">
                <span className="text-xs text-slate-500 font-medium">
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
                            ? 'bg-[#0b203c] text-white hover:bg-[#142d52]'
                            : 'text-slate-600'
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
              <div className="shrink-0 border-t border-slate-100 px-4 py-2 bg-white">
                <span className="text-xs text-slate-400 font-medium">{total} phản hồi</span>
              </div>
            )}
          </div>

          {/* Right Side: Detail */}
          <div
            className={`absolute inset-0 lg:relative lg:w-1/2 flex flex-col z-20 bg-slate-50 transition-transform ${
              selectedId ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            }`}
          >
            <FeedbackDetailPane feedback={selectedFeedback} />

            {/* Mobile Back Button */}
            {selectedId && (
              <button
                className="lg:hidden absolute top-4 left-4 p-2 bg-white rounded-full shadow-md z-50 text-slate-700"
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
