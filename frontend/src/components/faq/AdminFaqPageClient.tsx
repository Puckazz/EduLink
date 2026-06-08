'use client';

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, CircleHelp, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
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
import { FaqFilterBar } from '@/components/faq/FaqFilterBar';
import { FaqDialog } from '@/components/faq/FaqDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAdminFaqs } from '@/hooks/queries/useFaqs';
import { useDeleteFaq } from '@/hooks/mutations/useFaqMutations';
import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from '@/types/feedback';
import type { Faq } from '@/types/faq';
import { formatDate, normalizeText } from '@/utils';

const PAGE_SIZE = 10;

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <StatusBadge status="Đã kích hoạt" label="Hiển thị" />
  ) : (
    <StatusBadge status="Chưa kích hoạt" label="Đã ẩn" />
  );
}

function CategoryBadge({ category }: { category: FeedbackCategory }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {FEEDBACK_CATEGORY_LABELS[category]}
    </span>
  );
}

export function AdminFaqPageClient() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | 'ALL'>('ALL');
  const [selectedActive, setSelectedActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<Faq | null>(null);

  const { data: faqs = [], isLoading } = useAdminFaqs();
  const deleteMutation = useDeleteFaq();

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedActive]);

  const filteredFaqs = useMemo(() => {
    const q = normalizeText(search.trim());
    return faqs.filter((faq) => {
      const matchSearch =
        !q ||
        normalizeText(faq.question).includes(q) ||
        normalizeText(faq.answer).includes(q) ||
        normalizeText(FEEDBACK_CATEGORY_LABELS[faq.category]).includes(q);

      const matchCategory =
        selectedCategory === 'ALL' || faq.category === selectedCategory;

      const matchActive =
        selectedActive === 'all' ||
        (selectedActive === 'active' && faq.is_active) ||
        (selectedActive === 'inactive' && !faq.is_active);

      return matchSearch && matchCategory && matchActive;
    });
  }, [faqs, search, selectedCategory, selectedActive]);

  const totalItems = filteredFaqs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const paginatedFaqs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredFaqs.slice(start, start + PAGE_SIZE);
  }, [filteredFaqs, currentPage]);

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setDialogOpen(true);
  };

  const handleOpenDelete = (faq: Faq) => {
    setDeletingFaq(faq);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingFaq) return;
    deleteMutation.mutate(deletingFaq.faq_id, {
      onSuccess: () => {
        toast.success('Đã xóa câu hỏi thành công.');
        setConfirmOpen(false);
        setDeletingFaq(null);
      },
      onError: () => {
        toast.error('Không thể xóa câu hỏi. Vui lòng thử lại.');
      },
    });
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Câu hỏi thường gặp
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý nội dung hỏi đáp hiển thị cho phụ huynh và giáo viên.
          </p>
        </div>
        <Button id="faq-add-btn" onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Thêm câu hỏi
        </Button>
      </div>

      {/* Filter bar */}
      <FaqFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedActive={selectedActive}
        onActiveChange={setSelectedActive}
      />

      {/* Table card */}
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Câu hỏi
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Chủ đề
                </th>
                <th className="px-6 py-3.5 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Thứ tự
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Trạng thái
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
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedFaqs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <CircleHelp className="h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {faqs.length === 0
                          ? 'Chưa có câu hỏi nào.'
                          : 'Không tìm thấy câu hỏi phù hợp với bộ lọc.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedFaqs.map((faq, idx) => (
                  <tr
                    key={faq.faq_id}
                    className={`group transition-colors hover:bg-muted/50 ${
                      idx < paginatedFaqs.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    {/* Question */}
                    <td className="px-6 py-4 w-full max-w-0">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                          {faq.question}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {faq.answer}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CategoryBadge category={faq.category} />
                    </td>

                    {/* Sort order */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {faq.sort_order}
                      </span>
                    </td>

                    {/* Active status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ActiveBadge active={faq.is_active} />
                    </td>

                    {/* Created at */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(faq.created_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 pr-6 text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            id={`faq-action-${faq.faq_id}`}
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
                            id={`faq-edit-${faq.faq_id}`}
                            onClick={() => handleOpenEdit(faq)}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            id={`faq-delete-${faq.faq_id}`}
                            onClick={() => handleOpenDelete(faq)}
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
      <FaqDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingFaq={editingFaq}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Xóa câu hỏi"
        description={
          deletingFaq
            ? `Bạn có chắc chắn muốn xóa câu hỏi "${deletingFaq.question.slice(0, 60)}${deletingFaq.question.length > 60 ? '…' : ''}"? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xóa câu hỏi này?'
        }
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleteMutation.isPending}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingFaq(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
