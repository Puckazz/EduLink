'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ParentDetailDialog } from '@/components/parents/ParentDetailDialog';
import { ParentFilterBar } from '@/components/parents/ParentFilterBar';
import { ParentFormModal } from '@/components/parents/ParentFormModal';
import { ParentsPageHeader } from '@/components/parents/ParentsPageHeader';
import { ParentsTableCard } from '@/components/parents/ParentsTableCard';
import { useParents } from '@/components/parents/hooks/useParents';
import { mapParentToTableRow } from '@/components/parents/mappers/parent.mapper';
import { useParentFormModalStore } from '@/components/parents/stores/useParentFormModalStore';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { useDebounce } from '@/hooks/useDebounce';
import type {
  ParentStatusFilter,
  ParentRelationshipFilter,
  ParentSortOption,
} from '@/types/parent';

const PAGE_SIZE = 10;

function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Không thể tải danh sách phụ huynh.';
  }

  const responseMessage = error.response?.data?.message;

  if (Array.isArray(responseMessage) && responseMessage.length > 0) {
    return responseMessage[0];
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  return 'Không thể tải danh sách phụ huynh.';
}

function downloadCsv(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

function toCsvCell(value: string): string {
  const escapedValue = value.replaceAll('"', '""');
  return `"${escapedValue}"`;
}

export function ParentsPageClient() {
  const openCreateModal = useParentFormModalStore(
    (state) => state.openCreateModal,
  );
  const openEditModal = useParentFormModalStore((state) => state.openEditModal);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ParentStatusFilter>('');
  const [selectedRelationship, setSelectedRelationship] = useState<ParentRelationshipFilter>('');
  const [selectedSort, setSelectedSort] = useState<ParentSortOption>('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailParentId, setDetailParentId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search.trim(), 400);

  const parentsQuery = useParents({
    currentPage,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    status: selectedStatus,
    relationship: selectedRelationship,
    sort: selectedSort,
  });

  useEffect(() => {
    if (currentPage > parentsQuery.totalPages) {
      setCurrentPage(parentsQuery.totalPages);
    }
  }, [currentPage, parentsQuery.totalPages]);

  const tableParents = parentsQuery.rows.map(mapParentToTableRow);
  const isLoading = parentsQuery.isPending;
  const isBusy = parentsQuery.isPending || parentsQuery.isFetching;
  const errorMessage = parentsQuery.error
    ? getApiErrorMessage(parentsQuery.error)
    : null;

  const handleRetry = () => {
    void parentsQuery.refetch();
  };

  const handleSearchChange = (value: string) => {
    setCurrentPage(1);
    setSearch(value);
  };

  const handleStatusChange = (value: ParentStatusFilter) => {
    setCurrentPage(1);
    setSelectedStatus(value);
  };

  const handleRelationshipChange = (value: ParentRelationshipFilter) => {
    setCurrentPage(1);
    setSelectedRelationship(value);
  };

  const handleSortChange = (value: ParentSortOption) => {
    setCurrentPage(1);
    setSelectedSort(value);
  };

  const handleViewDetails = (parentId: number) => {
    setDetailParentId(parentId);
    setIsDetailOpen(true);
  };

  const handleEditParent = (parentId: number) => {
    const selectedParent = parentsQuery.filteredRows.find(
      (parent) => parent.parent_id === parentId,
    );

    if (!selectedParent) {
      toast.error('Không tìm thấy thông tin phụ huynh để chỉnh sửa.');
      return;
    }

    openEditModal(selectedParent);
  };

  const handleToggleLock = (parentId: number) => {
    toast.info(
      `Tài khoản #PR${String(parentId).padStart(5, '0')} chưa thể khóa/mở khóa do API chưa hỗ trợ cập nhật trạng thái.`,
    );
  };

  const handleExport = () => {
    if (parentsQuery.filteredRows.length === 0) {
      toast.warning('Không có dữ liệu để xuất.');
      return;
    }

    const header = ['ID', 'Ho ten', 'So dien thoai', 'Email', 'Trang thai'];
    const lines = parentsQuery.filteredRows.map((parent) =>
      [
        `PR${String(parent.parent_id).padStart(5, '0')}`,
        parent.full_name,
        parent.phone,
        parent.email ?? '',
        parent.is_active ? 'Da kich hoat' : 'Chua kich hoat',
      ]
        .map(toCsvCell)
        .join(','),
    );

    downloadCsv(
      [header.join(','), ...lines].join('\n'),
      `parents-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    toast.success('Đã xuất dữ liệu phụ huynh.');
  };

  return (
    <div className="space-y-6">
      <ParentsPageHeader
        totalItems={parentsQuery.totalItems}
        onExport={handleExport}
        onAddParent={openCreateModal}
      />

      <ParentFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        selectedRelationship={selectedRelationship}
        onRelationshipChange={handleRelationshipChange}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
      />

      <ParentsTableCard
        errorMessage={errorMessage}
        isLoading={isLoading}
        parents={tableParents}
        onRetry={handleRetry}
        onViewDetails={handleViewDetails}
        onEditParent={handleEditParent}
        onToggleLock={handleToggleLock}
        footer={
          <PaginationBar
            currentPage={currentPage}
            totalPages={parentsQuery.totalPages}
            totalItems={parentsQuery.totalItems}
            pageSize={PAGE_SIZE}
            isBusy={isBusy}
            onPageChange={setCurrentPage}
          />
        }
      />

      <ParentFormModal />
      <ParentDetailDialog
        isOpen={isDetailOpen}
        parentId={detailParentId}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
