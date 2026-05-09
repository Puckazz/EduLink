'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useStudentParentLinks } from '@/hooks/queries/useStudentParentLinks';
import { ParentLinkCreateForm } from '@/components/parents/ParentLinkCreateForm';
import { ParentStudentLinkTable } from '@/components/parents/ParentStudentLinkTable';
import { mapStudentsToLinkRows } from '@/mappers/parent-link.mapper';
import { AlertCircle, RefreshCcw } from 'lucide-react';

function LinkTableSkeleton() {
  return (
    <div className="space-y-3 px-6 py-5">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  );
}

function ParentLinksPageClient() {
  const { data, isLoading, error, refetch } = useStudentParentLinks();

  const linkRows = data ? mapStudentsToLinkRows(data.data) : [];

  return (
    <div className="space-y-6">
      {/* Page Header — đồng bộ với ParentsPageHeader */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Thiết lập &amp; Quản lý Liên kết
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kết nối hồ sơ sinh viên với phụ huynh hoặc người giám hộ hợp pháp.
          </p>
        </div>
      </div>

      {/* Create Form */}
      <ParentLinkCreateForm />

      {/* Table Card — đồng bộ với ParentsTableCard */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Không thể tải dữ liệu
              </p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Vui lòng thử lại'}
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => void refetch()}
            >
              <RefreshCcw className="h-4 w-4" />
              Thử lại
            </Button>
          </div>
        ) : isLoading ? (
          <LinkTableSkeleton />
        ) : (
          <ParentStudentLinkTable links={linkRows} />
        )}
      </div>
    </div>
  );
}

export default ParentLinksPageClient;
