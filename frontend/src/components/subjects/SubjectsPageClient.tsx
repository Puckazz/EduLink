'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, BookOpen, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
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
import { TableSkeletonRows } from '@/components/shared/table/TableSkeletonRows';
import { SubjectFilterBar } from '@/components/subjects/SubjectFilterBar';
import { SubjectDialog } from '@/components/subjects/SubjectDialog';
import { useSubjects } from '@/hooks/queries/useSubjects';
import { useDeleteSubject } from '@/hooks/mutations/useSubjectMutations';
import type { Subject } from '@/types/subject';

const PAGE_SIZE = 10;

export function SubjectsPageClient() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  // Reset to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: resData, isLoading } = useSubjects({
    search: search.trim() || undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const deleteMutation = useDeleteSubject();

  const subjects = resData?.data ?? [];
  const totalItems = resData?.pagination?.total ?? 0;
  const totalPages = resData?.pagination?.total_pages ?? 1;

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setDialogOpen(true);
  };

  const handleOpenDelete = (subject: Subject) => {
    setDeletingSubject(subject);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingSubject) return;
    deleteMutation.mutate(deletingSubject.subject_id, {
      onSuccess: () => {
        toast.success('Đã xóa môn học thành công.');
        setConfirmOpen(false);
        setDeletingSubject(null);
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể xóa môn học.';
        toast.error(msg);
      },
    });
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý môn học
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách các môn học và số tín chỉ của môn học.
          </p>
        </div>
        <Button id="subject-add-btn" onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Thêm môn học
        </Button>
      </div>

      {/* Filter bar */}
      <SubjectFilterBar search={search} onSearchChange={setSearch} />

      {/* Table card */}
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Mã môn học
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Tên môn học
                </th>
                <th className="px-6 py-3.5 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Số tín chỉ
                </th>
                <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap pr-6 w-16">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows
                  columns={4}
                  skeletonClassNames={['w-28', 'w-64', 'w-24', 'w-8']}
                />
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {totalItems === 0
                          ? 'Chưa có môn học nào.'
                          : 'Không tìm thấy môn học phù hợp với bộ lọc.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                subjects.map((subject, idx) => (
                  <tr
                    key={subject.subject_id}
                    className={`group transition-colors hover:bg-muted/50 ${
                      idx < subjects.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    {/* Subject Code */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                      {subject.subject_code}
                    </td>

                    {/* Subject Name */}
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {subject.subject_name}
                    </td>

                    {/* Credit */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-850 dark:text-slate-200">
                        {subject.credit !== null && subject.credit !== undefined
                          ? `${subject.credit} tín chỉ`
                          : 'Chưa cấu hình'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 pr-6 text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            id={`subject-action-${subject.subject_id}`}
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
                            id={`subject-edit-${subject.subject_id}`}
                            onClick={() => handleOpenEdit(subject)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            id={`subject-delete-${subject.subject_id}`}
                            onClick={() => handleOpenDelete(subject)}
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
      <SubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingSubject={editingSubject}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Xóa môn học"
        description={
          deletingSubject
            ? `Bạn có chắc chắn muốn xóa môn học "${deletingSubject.subject_name}"? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa môn học này?'
        }
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleteMutation.isPending}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingSubject(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
