import { AlertCircle, RefreshCcw } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ParentTable } from '@/components/parents/ParentTable';
import type { ParentTableRow } from '@/components/parents/mappers/parent.mapper';

interface ParentsTableCardProps {
  errorMessage: string | null;
  isLoading: boolean;
  parents: ParentTableRow[];
  onRetry: () => void;
  onViewDetails: (parentId: number) => void;
  onEditParent: (parentId: number) => void;
  onToggleLock: (parentId: number) => void;
  footer: ReactNode;
}

function ParentTableSkeleton() {
  return (
    <div className="space-y-3 px-6 py-5">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  );
}

export function ParentsTableCard({
  errorMessage,
  isLoading,
  parents,
  onRetry,
  onViewDetails,
  onEditParent,
  onToggleLock,
  footer,
}: ParentsTableCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      {errorMessage ? (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Không thể tải dữ liệu
            </p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={onRetry}>
            <RefreshCcw className="h-4 w-4" />
            Thử lại
          </Button>
        </div>
      ) : isLoading ? (
        <ParentTableSkeleton />
      ) : (
        <ParentTable
          parents={parents}
          onViewDetails={onViewDetails}
          onEditParent={onEditParent}
          onToggleLock={onToggleLock}
        />
      )}

      {footer}
    </div>
  );
}
