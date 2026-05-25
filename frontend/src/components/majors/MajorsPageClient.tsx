'use client';

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, GraduationCap, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { MajorFilterBar } from '@/components/majors/MajorFilterBar';
import { MajorDialog } from '@/components/majors/MajorDialog';
import { useMajors } from '@/components/students/hooks/useMajors';
import { useDeleteMajor } from '@/hooks/mutations/useMajorMutations';
import type { Major } from '@/types/major';

const PAGE_SIZE = 10;

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function MajorsPageClient() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingMajor, setDeletingMajor] = useState<Major | null>(null);

  const { data: majors = [], isLoading } = useMajors();
  const deleteMutation = useDeleteMajor();

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredMajors = useMemo(() => {
    const q = normalizeText(search.trim());
    return majors.filter((m) => {
      return (
        !q ||
        normalizeText(m.major_code).includes(q) ||
        normalizeText(m.major_name).includes(q)
      );
    });
  }, [majors, search]);

  const totalItems = filteredMajors.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const paginatedMajors = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMajors.slice(start, start + PAGE_SIZE);
  }, [filteredMajors, currentPage]);

  const handleOpenCreate = () => {
    setEditingMajor(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (major: Major) => {
    setEditingMajor(major);
    setDialogOpen(true);
  };

  const handleOpenDelete = (major: Major) => {
    setDeletingMajor(major);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingMajor) return;
    deleteMutation.mutate(deletingMajor.major_id, {
      onSuccess: () => {
        toast.success('Đã xóa ngành học thành công.');
        setConfirmOpen(false);
        setDeletingMajor(null);
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể xóa ngành học.';
        toast.error(msg);
      },
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý ngành học
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách các ngành đào tạo trong hệ thống.
          </p>
        </div>
        <Button id="major-add-btn" onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Thêm ngành học
        </Button>
      </div>

      {/* Filter bar */}
      <MajorFilterBar search={search} onSearchChange={setSearch} />

      {/* Table card */}
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Mã ngành
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Tên ngành học
                </th>
                <th className="px-6 py-3.5 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Số sinh viên
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Ngày tạo
                </th>
                <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap pr-6 w-16">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedMajors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <GraduationCap className="h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {majors.length === 0
                          ? 'Chưa có ngành học nào.'
                          : 'Không tìm thấy ngành học phù hợp với bộ lọc.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMajors.map((major, idx) => (
                  <tr
                    key={major.major_id}
                    className={`group transition-colors hover:bg-muted/50 ${
                      idx < paginatedMajors.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    {/* Major Code */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                      {major.major_code}
                    </td>

                    {/* Major Name */}
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {major.major_name}
                    </td>

                    {/* Student Count */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                        {major._count?.students ?? 0} sinh viên
                      </span>
                    </td>

                    {/* Created at */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(major.created_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 pr-6 text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            id={`major-action-${major.major_id}`}
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            id={`major-edit-${major.major_id}`}
                            onClick={() => handleOpenEdit(major)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            id={`major-delete-${major.major_id}`}
                            onClick={() => handleOpenDelete(major)}
                            className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            isBusy={isLoading}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Create / Edit dialog */}
      <MajorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingMajor={editingMajor}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Xóa ngành học"
        description={
          deletingMajor
            ? `Bạn có chắc chắn muốn xóa ngành học "${deletingMajor.major_name}"? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa ngành học này?'
        }
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleteMutation.isPending}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingMajor(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
