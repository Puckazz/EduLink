'use client';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { TeacherDetailDialog } from '@/components/teachers/TeacherDetailDialog';
import { TeacherFilterBar } from '@/components/teachers/TeacherFilterBar';
import { TeacherFormModal } from '@/components/teachers/TeacherFormModal';
import { TeachersPageHeader } from '@/components/teachers/TeachersPageHeader';
import { TeachersTableCard } from '@/components/teachers/TeachersTableCard';
import { useDeleteTeacherMutation } from '@/components/teachers/hooks/useDeleteTeacherMutation';
import { useTeachers } from '@/components/teachers/hooks/useTeachers';
import { mapTeacherToTableRow } from '@/components/teachers/mappers/teacher.mapper';
import { useTeacherFormModalStore } from '@/components/teachers/stores/useTeacherFormModalStore';
import { useDebounce } from '@/hooks/useDebounce';
import type { Teacher, TeacherSortOption } from '@/types/teacher';

const PAGE_SIZE = 10;

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const responseMessage = error.response?.data?.message;

  if (Array.isArray(responseMessage) && responseMessage.length > 0) {
    return responseMessage[0];
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  return fallback;
}

export function TeachersPageClient() {
  const openCreateModal = useTeacherFormModalStore(
    (state) => state.openCreateModal,
  );
  const openEditModal = useTeacherFormModalStore(
    (state) => state.openEditModal,
  );

  const [search, setSearch] = useState('');
  const [selectedSort, setSelectedSort] =
    useState<TeacherSortOption>('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailTeacher, setDetailTeacher] = useState<Teacher | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 400);

  const teachersQuery = useTeachers({
    currentPage,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    sort: selectedSort,
  });

  const totalPages = Math.max(1, teachersQuery.totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const tableTeachers = useMemo(
    () => teachersQuery.rows.map(mapTeacherToTableRow),
    [teachersQuery.rows],
  );

  const isLoading = teachersQuery.isPending;
  const isBusy = teachersQuery.isPending || teachersQuery.isFetching;
  const errorMessage = teachersQuery.error
    ? getApiErrorMessage(
        teachersQuery.error,
        'Không thể tải danh sách giảng viên.',
      )
    : null;

  const deleteMutation = useDeleteTeacherMutation({
    onSuccess: () => {
      toast.success('Đã xóa giảng viên thành công.');
      setIsConfirmOpen(false);
      setDeletingTeacher(null);
    },
  });

  const handleRetry = () => {
    void teachersQuery.refetch();
  };

  const handleSearchChange = (value: string) => {
    setCurrentPage(1);
    setSearch(value);
  };

  const handleSortChange = (value: TeacherSortOption) => {
    setCurrentPage(1);
    setSelectedSort(value);
  };

  const findTeacherById = (teacherId: number) =>
    teachersQuery.rows.find((teacher) => teacher.teacher_id === teacherId);

  const handleViewDetails = (teacherId: number) => {
    const teacher = findTeacherById(teacherId);
    if (!teacher) {
      toast.error('Không tìm thấy thông tin giảng viên.');
      return;
    }

    setDetailTeacher(teacher);
    setIsDetailOpen(true);
  };

  const handleEditTeacher = (teacherId: number) => {
    const teacher = findTeacherById(teacherId);
    if (!teacher) {
      toast.error('Không tìm thấy thông tin giảng viên để chỉnh sửa.');
      return;
    }

    openEditModal(teacher);
  };

  const handleDeleteTeacher = (teacherId: number) => {
    const teacher = findTeacherById(teacherId);
    if (!teacher) {
      toast.error('Không tìm thấy thông tin giảng viên để xóa.');
      return;
    }

    setDeletingTeacher(teacher);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeacher) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deletingTeacher.teacher_id);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Không thể xóa giảng viên.'),
      );
    }
  };

  return (
    <div className="space-y-6">
      <TeachersPageHeader
        totalItems={teachersQuery.totalItems}
        onAddTeacher={openCreateModal}
      />

      <TeacherFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
      />

      <TeachersTableCard
        errorMessage={errorMessage}
        isLoading={isLoading}
        teachers={tableTeachers}
        onRetry={handleRetry}
        onViewDetails={handleViewDetails}
        onEditTeacher={handleEditTeacher}
        onDeleteTeacher={handleDeleteTeacher}
        footer={
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={teachersQuery.totalItems}
            pageSize={PAGE_SIZE}
            isBusy={isBusy}
            onPageChange={setCurrentPage}
          />
        }
      />

      <TeacherFormModal />
      <TeacherDetailDialog
        teacher={detailTeacher}
        isOpen={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setDetailTeacher(null);
        }}
      />
      <ConfirmDialog
        open={isConfirmOpen}
        title="Xóa giảng viên"
        description={
          deletingTeacher
            ? `Bạn có chắc chắn muốn xóa giảng viên "${deletingTeacher.full_name}"? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa giảng viên này?'
        }
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleteMutation.isPending}
        onCancel={() => {
          setIsConfirmOpen(false);
          setDeletingTeacher(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
