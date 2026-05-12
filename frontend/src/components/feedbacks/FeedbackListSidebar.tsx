import { useState } from 'react';
import { ListFilter, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Feedback, FeedbackStatus, FeedbackCategory, FeedbackStats } from '@/types/feedback';
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUS_LABELS,
} from '@/types/feedback';

export type SortByOption = 'updated_at' | 'created_at';
export type SortOrderOption = 'asc' | 'desc';

interface SidebarProps {
  feedbacks: Feedback[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  statusFilter: FeedbackStatus | 'ALL';
  onStatusFilterChange: (v: FeedbackStatus | 'ALL') => void;
  categoryFilter: FeedbackCategory | 'ALL';
  onCategoryFilterChange: (v: FeedbackCategory | 'ALL') => void;
  sortBy: SortByOption;
  sortOrder: SortOrderOption;
  onSortChange: (sortBy: SortByOption, sortOrder: SortOrderOption) => void;
  stats: FeedbackStats | undefined;
  isLoading: boolean;
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const styles: Record<FeedbackStatus, string> = {
    OPEN: 'bg-amber-50 text-amber-700',
    IN_PROGRESS: 'bg-blue-50 text-blue-700',
    RESOLVED: 'bg-green-50 text-green-700',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${styles[status]}`}>
      {FEEDBACK_STATUS_LABELS[status]}
    </span>
  );
}

const CATEGORIES: { value: FeedbackCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả danh mục' },
  ...Object.entries(FEEDBACK_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as FeedbackCategory,
    label,
  })),
];

const SORT_OPTIONS: { sortBy: SortByOption; sortOrder: SortOrderOption; label: string }[] = [
  { sortBy: 'updated_at', sortOrder: 'desc', label: 'Cập nhật mới nhất' },
  { sortBy: 'updated_at', sortOrder: 'asc', label: 'Cập nhật cũ nhất' },
  { sortBy: 'created_at', sortOrder: 'desc', label: 'Ngày tạo mới nhất' },
  { sortBy: 'created_at', sortOrder: 'asc', label: 'Ngày tạo cũ nhất' },
];

export function FeedbackListSidebar({
  feedbacks,
  selectedId,
  onSelect,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  stats,
  isLoading,
}: SidebarProps) {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);

  const hasActiveFilter = categoryFilter !== 'ALL';
  const isCustomSort = !(sortBy === 'updated_at' && sortOrder === 'desc');

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.sortOrder === sortOrder)?.label ??
    'Cập nhật mới nhất';

  const statusOptions: { value: FeedbackStatus | 'ALL'; label: string; count?: number }[] = [
    { value: 'ALL', label: 'Tất cả phản hồi', count: stats?.total },
    { value: 'OPEN', label: 'Chờ xử lý', count: stats?.open },
    { value: 'IN_PROGRESS', label: 'Đang xử lý', count: stats?.inProgress },
    { value: 'RESOLVED', label: 'Đã giải quyết', count: stats?.resolved },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-r border-border w-full shrink-0">
      {/* Filter bar */}
      <div className="p-4 border-b border-border space-y-2">
        <div className="flex items-center gap-2">
          {/* Status select with counter badges */}
          <Select
            value={statusFilter}
            onValueChange={(v) => onStatusFilterChange(v as FeedbackStatus | 'ALL')}
          >
            <SelectTrigger className="flex-1 h-9 bg-transparent border-border text-sm font-semibold text-foreground min-w-0">
              <SelectValue placeholder="Tất cả phản hồi" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-3 w-full">
                    <span>{opt.label}</span>
                    {opt.count !== undefined && (
                      <span
                        className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                          opt.value === 'OPEN' && opt.count > 0
                            ? 'bg-amber-100 text-amber-700'
                            : opt.value === 'IN_PROGRESS' && opt.count > 0
                            ? 'bg-blue-100 text-blue-700'
                            : opt.value === 'RESOLVED' && opt.count > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {opt.count}
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort popover */}
          <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={`relative p-2 rounded-md transition-colors shrink-0 ${
                  isCustomSort
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title="Sắp xếp"
              >
                {sortOrder === 'asc' ? (
                  <ArrowUp className="h-5 w-5" />
                ) : sortOrder === 'desc' ? (
                  <ArrowDown className="h-5 w-5" />
                ) : (
                  <ArrowUpDown className="h-5 w-5" />
                )}
                {isCustomSort && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-2" align="end">
              <p className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                Sắp xếp theo
              </p>
              <div className="flex flex-col gap-0.5">
                {SORT_OPTIONS.map((opt) => {
                  const isActive = opt.sortBy === sortBy && opt.sortOrder === sortOrder;
                  return (
                    <button
                      key={`${opt.sortBy}-${opt.sortOrder}`}
                      onClick={() => {
                        onSortChange(opt.sortBy, opt.sortOrder);
                        setSortPopoverOpen(false);
                      }}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors flex items-center gap-2 ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      {opt.sortOrder === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 shrink-0" />
                      )}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Category filter popover */}
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={`relative p-2 rounded-md transition-colors shrink-0 ${
                  hasActiveFilter
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title="Lọc theo danh mục"
              >
                <ListFilter className="h-5 w-5" />
                {hasActiveFilter && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <p className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                Lọc theo danh mục
              </p>
              <div className="flex flex-col gap-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      onCategoryFilterChange(cat.value);
                      setFilterPopoverOpen(false);
                    }}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                      categoryFilter === cat.value
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active filter chips */}
        {(hasActiveFilter || isCustomSort) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {hasActiveFilter && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-0.5 font-semibold">
                {FEEDBACK_CATEGORY_LABELS[categoryFilter as FeedbackCategory]}
                <button
                  onClick={() => onCategoryFilterChange('ALL')}
                  className="hover:text-primary/70 transition-colors ml-0.5"
                  title="Xóa bộ lọc"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {isCustomSort && (
              <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 font-medium">
                {currentSortLabel}
                <button
                  onClick={() => onSortChange('updated_at', 'desc')}
                  className="hover:text-foreground transition-colors ml-0.5"
                  title="Đặt lại sắp xếp"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 border-b border-border">
                <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-48 bg-muted/50 rounded animate-pulse mb-2" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm font-medium">Không có phản hồi nào</p>
          </div>
        ) : (
          feedbacks.map((fb) => {
            const isActive = fb.feedback_id === selectedId;
            const latestMsg = fb.messages?.[0];

            return (
              <div
                key={fb.feedback_id}
                onClick={() => onSelect(fb.feedback_id)}
                className={`p-4 border-b border-border cursor-pointer transition-colors ${
                  isActive ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold text-sm ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
                    {fb.parent?.full_name ?? '—'}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium shrink-0 ml-2">
                    {new Date(fb.updated_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground font-medium mb-1 truncate">
                  {FEEDBACK_CATEGORY_LABELS[fb.category]}
                  {fb.student && ` · ${fb.student.full_name}`}
                </p>

                <p className={`text-sm font-bold mb-1 truncate ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
                  {fb.title}
                </p>

                {latestMsg && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-1 mb-2">
                    {latestMsg.content}
                  </p>
                )}

                <StatusBadge status={fb.status} />
              </div>
            );
          })
        )}
      </ScrollArea>
    </div>
  );
}
