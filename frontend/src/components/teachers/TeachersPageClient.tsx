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
import { useSetTeacherLockMutation } from '@/components/teachers/hooks/useSetTeacherLockMutation';
import { useTeachers } from '@/components/teachers/hooks/useTeachers';
import { mapTeacherToTableRow } from '@/components/teachers/mappers/teacher.mapper';
import { useTeacherFormModalStore } from '@/components/teachers/stores/useTeacherFormModalStore';
import { useDebounce } from '@/hooks/useDebounce';
import type {
  Teacher,
  TeacherSortOption,
  TeacherStatusFilter,
} from '@/types/teacher';

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
  const [selectedStatus, setSelectedStatus] =
    useState<TeacherStatusFilter>('');
  const [selectedSort, setSelectedSort] =
    useState<TeacherSortOption>('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailTeacher, setDetailTeacher] = useState<Teacher | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [lockingTeacher, setLockingTeacher] = useState<Teacher | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 400);

  const teachersQuery = useTeachers({
    currentPage,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    status: selectedStatus,
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

  const setTeacherLockMutation = useSetTeacherLockMutation();

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

  const handleStatusChange = (value: TeacherStatusFilter) => {
    setCurrentPage(1);
    setSelectedStatus(value);
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

  const handleToggleLock = (teacherId: number) => {
    const teacher = findTeacherById(teacherId);
    if (!teacher) {
      toast.error('Không tìm thấy thông tin giảng viên để cập nhật trạng thái.');
      return;
    }

    setLockingTeacher(teacher);
    setIsConfirmOpen(true);
  };

  const handleConfirmLock = async () => {
    if (!lockingTeacher) {
      return;
    }

    const nextLocked = !lockingTeacher.is_locked;

    try {
      await setTeacherLockMutation.mutateAsync({
        teacherId: lockingTeacher.teacher_id,
        isLocked: nextLocked,
      });
      toast.success(
        nextLocked
          ? 'Đã khóa tài khoản giảng viên.'
          : 'Đã mở khóa tài khoản giảng viên.',
      );
      setIsConfirmOpen(false);
      setLockingTeacher(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Không thể cập nhật trạng thái giảng viên.'),
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
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
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
        onToggleLock={handleToggleLock}
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
        title={
          lockingTeacher?.is_locked
            ? 'Mở khóa tài khoản giảng viên'
            : 'Khóa tài khoản giảng viên'
        }
        description={
          lockingTeacher
            ? lockingTeacher.is_locked
              ? `Bạn có chắc chắn muốn mở khóa tài khoản giảng viên "${lockingTeacher.full_name}"? Giảng viên sẽ có thể đăng nhập lại.`
              : `Bạn có chắc chắn muốn khóa tài khoản giảng viên "${lockingTeacher.full_name}"? Phiên đăng nhập hiện tại của giảng viên sẽ bị vô hiệu hóa.`
            : 'Bạn có chắc chắn muốn cập nhật trạng thái khóa tài khoản giảng viên này?'
        }
        confirmText={lockingTeacher?.is_locked ? 'Mở khóa' : 'Khóa'}
        cancelText="Hủy"
        isLoading={setTeacherLockMutation.isPending}
        onCancel={() => {
          setIsConfirmOpen(false);
          setLockingTeacher(null);
        }}
        onConfirm={handleConfirmLock}
      />
    </div>
  );
}
