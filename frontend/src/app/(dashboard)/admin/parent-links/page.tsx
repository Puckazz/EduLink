'use client';

import { Spinner } from '@/components/ui/spinner';
import { useStudentParentLinks } from '@/hooks/queries/useStudentParentLinks';
import { ParentLinkCreateForm } from '@/components/parents/ParentLinkCreateForm';
import { ParentStudentLinkTable } from '@/components/parents/ParentStudentLinkTable';
import { mapStudentsToLinkRows } from '@/mappers/parent-link.mapper';
import { ChevronRight } from 'lucide-react';

function ParentLinksPageClient() {
  const { data, isLoading, error } = useStudentParentLinks();

  const linkRows = data ? mapStudentsToLinkRows(data.data) : [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive font-medium">Lỗi khi tải dữ liệu</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error instanceof Error ? error.message : 'Vui lòng thử lại'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[2rem] font-bold tracking-tight text-slate-900">
          Thiết lập & Quản lý Liên kết
        </h1>
        <p className="text-slate-600 mt-2 text-base">
          Kết nối hồ sơ sinh viên với phụ huynh hoặc người giám hộ hợp pháp.
        </p>
      </div>

      {/* Create Form */}
      <ParentLinkCreateForm />

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <ParentStudentLinkTable links={linkRows} />
        </div>
      )}
    </div>
  );
}

export default ParentLinksPageClient;
