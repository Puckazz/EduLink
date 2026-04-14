'use client';

import { useState } from 'react';
import axios from 'axios';
import { StudentFilterBar } from '@/components/students/StudentFilterBar';
import { StudentCreateModal } from '@/components/students/StudentCreateModal';
import { StudentsPageHeader } from '@/components/students/StudentsPageHeader';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { StudentsTableCard } from '@/components/students/StudentsTableCard';
import { useMajors } from '@/components/students/hooks/useMajors';
import { useStudents } from '@/components/students/hooks/useStudents';
import { mapStudentToTableStudent } from '@/components/students/mappers/student.mapper';
import { useStudentCreateModalStore } from '@/components/students/stores/useStudentCreateModalStore';
import { useDebounce } from '@/hooks/useDebounce';
import type { StudentStatusValue } from '@/types/student';

const PAGE_SIZE = 10;

function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const responseMessage = error.response?.data?.message;

  if (Array.isArray(responseMessage) && responseMessage.length > 0) {
    return responseMessage[0];
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  return fallbackMessage;
}

export function StudentsPageClient() {
  const openCreateModal = useStudentCreateModalStore(
    (state) => state.openModal,
  );
  const [search, setSearch] = useState('');
  const [selectedMajorId, setSelectedMajorId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'' | StudentStatusValue>(
    '',
  );
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(search.trim(), 400);

  const majorsQuery = useMajors();
  const studentsQuery = useStudents({
    currentPage,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    majorId: selectedMajorId,
    status: selectedStatus,
  });

  const students = studentsQuery.data?.data ?? [];
  const majors = majorsQuery.data ?? [];
  const tableStudents = students.map(mapStudentToTableStudent);

  const totalItems = studentsQuery.data?.pagination.total ?? 0;
  const totalPages = Math.max(
    1,
    studentsQuery.data?.pagination.total_pages ?? 1,
  );

  const isLoading = studentsQuery.isPending || majorsQuery.isPending;
  const isRefetching = studentsQuery.isFetching || majorsQuery.isFetching;
  const isBusy = isLoading || isRefetching;

  const errorMessage = studentsQuery.error
    ? getApiErrorMessage(
        studentsQuery.error,
        'Không thể tải danh sách sinh viên.',
      )
    : majorsQuery.error
      ? getApiErrorMessage(
          majorsQuery.error,
          'Không thể tải danh sách chuyên ngành.',
        )
      : null;

  const handleRetry = () => {
    void Promise.all([studentsQuery.refetch(), majorsQuery.refetch()]);
  };

  const handleSearchChange = (value: string) => {
    setCurrentPage(1);
    setSearch(value);
  };

  const handleMajorChange = (value: string) => {
    setCurrentPage(1);
    setSelectedMajorId(value);
  };

  const handleStatusChange = (value: '' | StudentStatusValue) => {
    setCurrentPage(1);
    setSelectedStatus(value);
  };

  return (
    <div className="space-y-6">
      <StudentsPageHeader onAddStudent={openCreateModal} />

      <StudentFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        selectedMajorId={selectedMajorId}
        onMajorChange={handleMajorChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        majors={majors}
      />

      <StudentsTableCard
        errorMessage={errorMessage}
        isLoading={isLoading}
        students={tableStudents}
        onRetry={handleRetry}
        footer={
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            isBusy={isBusy}
            onPageChange={setCurrentPage}
          />
        }
      />

      <StudentCreateModal
        majors={majors}
        isMajorsLoading={majorsQuery.isPending}
      />
    </div>
  );
}
