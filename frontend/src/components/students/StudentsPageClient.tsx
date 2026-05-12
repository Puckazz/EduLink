'use client';

import { type ChangeEvent, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentService } from '@/services/student.service';
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
import type { StudentStatusValue, StudentSortOption } from '@/types/student';
import {
  exportStudentsToExcel,
  exportStudentImportTemplate,
  parseStudentImportFile,
} from '@/components/students/utils/student-excel';

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
  const [selectedStatus, setSelectedStatus] = useState<'' | StudentStatusValue>('');
  const [selectedSort, setSelectedSort] = useState<StudentSortOption>('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(search.trim(), 400);

  const majorsQuery = useMajors();
  const studentsQuery = useStudents({
    currentPage,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    majorId: selectedMajorId,
    status: selectedStatus,
    sort: selectedSort,
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

  const handleSortChange = (value: StudentSortOption) => {
    setCurrentPage(1);
    setSelectedSort(value);
  };

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'DANG_HOC' | 'DINH_CHI' }) =>
      StudentService.update(id, { status }),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công.');
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    },
  });

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Đình chỉ' ? 'DANG_HOC' : 'DINH_CHI';
    toggleStatusMutation.mutate({ id: Number(id), status: newStatus });
  };


  const handleExportExcel = () => {
    if (isExporting) return;
    if (tableStudents.length === 0) {
      toast.warning('Không có dữ liệu để xuất.');
      return;
    }
    setIsExporting(true);
    const majorSuffix = selectedMajorId ? `-${selectedMajorId}` : '-tat-ca-nganh';
    try {
      exportStudentsToExcel(tableStudents, `danh-sach-sinh-vien${majorSuffix}.xlsx`);
    } catch {
      toast.error('Không thể xuất file Excel.');
      setIsExporting(false);
      return;
    }
    exportStudentsToExcel(tableStudents, `danh-sach-sinh-vien${majorSuffix}.xlsx`);
    setIsExporting(false);
  };

  const handleImportClick = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (isImporting) return;

    setIsImporting(true);
    try {
      const result = await parseStudentImportFile(file);

      if (result.errors.length > 0) {
        for (const err of result.errors.slice(0, 3)) {
          toast.error(err);
        }
        if (result.errors.length > 3) {
          toast.warning(`… và ${result.errors.length - 3} lỗi khác. Vui lòng kiểm tra file.`);
        }
      }

      if (result.rows.length > 0) {
        toast.info(`Đọc thành công ${result.rows.length} sinh viên từ file. Tính năng nhập hàng loạt đang được phát triển.`);
      }
    } catch {
      toast.error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleExportTemplate = () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      exportStudentImportTemplate();
    } catch {
      toast.error('Không thể tải biểu mẫu.');
      setIsExporting(false);
      return;
    }
    exportStudentImportTemplate();
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleImportChange}
      />

      <StudentsPageHeader
        onAddStudent={openCreateModal}
        onExportExcel={handleExportExcel}
        onImportExcel={handleImportClick}
        onExportTemplate={handleExportTemplate}
        isExporting={isExporting}
        isImporting={isImporting}
      />

      <StudentFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        selectedMajorId={selectedMajorId}
        onMajorChange={handleMajorChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
        majors={majors}
      />

      <StudentsTableCard
        errorMessage={errorMessage}
        isLoading={isLoading}
        students={tableStudents}
        onRetry={handleRetry}
        onToggleStatus={handleToggleStatus}
        isToggling={toggleStatusMutation.isPending}
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
