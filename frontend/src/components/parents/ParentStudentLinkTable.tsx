'use client';

import { Download, Filter, Edit3, Link2Off, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/table/DataTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useRemoveParentMutation } from '@/hooks/mutations/useRemoveParentMutation';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import type { ParentStudentLinkRow } from '@/mappers/parent-link.mapper';
import { useState } from 'react';

const RELATIONSHIP_LABEL: Record<ParentStudentLinkRow['relationship'], string> =
  {
    CHA: 'Cha',
    ME: 'Mẹ',
    NGUOI_GIAM_HO: 'Giám hộ',
  };

const RELATIONSHIP_BADGE_CLASS: Record<
  ParentStudentLinkRow['relationship'],
  string
> = {
  CHA: 'border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-100',
  ME: 'border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100',
  NGUOI_GIAM_HO:
    'border-violet-200 bg-violet-100 text-violet-700 hover:bg-violet-100',
};

interface ParentStudentLinkTableProps {
  links: ParentStudentLinkRow[];
  isLoading?: boolean;
}

const LINK_COLUMNS: DataTableColumn[] = [
  {
    key: 'student',
    label: 'SINH VIÊN',
    className: 'px-4',
  },
  {
    key: 'studentCode',
    label: 'LỚP / MSSV',
    className: 'w-36 px-4',
  },
  {
    key: 'parent',
    label: 'PHỤ HUYNH',
    className: 'px-4',
  },
  {
    key: 'relationship',
    label: 'QUAN HỆ',
    className: 'w-32 px-4',
  },
  {
    key: 'contact',
    label: 'LIÊN LẠC',
    className: 'w-48 px-4',
  },
  {
    key: 'actions',
    label: 'THAO TÁC',
    align: 'right',
    className: 'w-24 px-4',
  },
];

export function ParentStudentLinkTable({ links }: ParentStudentLinkTableProps) {
  const [filterBy, setFilterBy] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const removeMutation = useRemoveParentMutation();
  const {
    isOpen,
    config,
    isLoading: isConfirmLoading,
    openConfirmDialog,
    closeConfirmDialog,
    handleConfirm,
  } = useConfirmDialog();

  const handleRemove = (link: ParentStudentLinkRow) => {
    openConfirmDialog({
      title: 'Xác nhận hủy liên kết',
      description: `Bạn có chắc chắn muốn hủy liên kết giữa ${link.student_name} và ${link.parent_name}?`,
      onConfirm: async () => {
        removeMutation.mutate({
          studentId: link.student_id,
          parentId: link.parent_id,
        });
      },
    });
  };

  const handleExport = () => {
    const headers = [
      'SINH VIÊN',
      'LỚP/MSSV',
      'PHỤ HUYNH',
      'QUAN HỆ',
      'EMAIL',
      'ĐIỆN THOẠI',
    ];
    const rows = links.map((link) => [
      link.student_name,
      `${link.class || 'N/A'} / ${link.student_code}`,
      link.parent_name,
      RELATIONSHIP_LABEL[link.relationship],
      link.email || '-',
      link.phone,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `parent-student-links-${new Date().toISOString().split('T')[0]}.csv`;
    anchor.click();
  };

  const filteredLinks =
    filterBy === 'ALL' ? links : links.filter((link) => link.relationship === filterBy);

  const totalItems = filteredLinks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const tableRows = paginatedLinks.map((link) => ({
    studentName: link.student_name,
    studentCode: `${link.class || 'N/A'} / ${link.student_code}`,
    parentName: link.parent_name,
    relationshipLabel: RELATIONSHIP_LABEL[link.relationship],
    relationshipBadgeClass: RELATIONSHIP_BADGE_CLASS[link.relationship],
    phone: link.phone,
    email: link.email || '-',
    link,
  }));

  return (
    <>
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Danh sách các liên kết hiện tại
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hiển thị {totalItems} kết quả
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Select
              value={filterBy}
              onValueChange={(value) => {
                setFilterBy(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-full min-w-0 bg-muted/40 text-sm font-medium sm:w-52">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue
                  placeholder="Tất cả quan hệ"
                  className="min-w-0 flex-1 truncate text-left"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả quan hệ</SelectItem>
                <SelectItem value="CHA">Cha</SelectItem>
                <SelectItem value="ME">Mẹ</SelectItem>
                <SelectItem value="NGUOI_GIAM_HO">Giám hộ</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 sm:w-auto"
              onClick={handleExport}
              disabled={links.length === 0}
            >
              <Download className="h-4 w-4" />
              Xuất dữ liệu
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        columns={LINK_COLUMNS}
        data={tableRows}
        emptyMessage="Không có liên kết phụ huynh-sinh viên nào."
        renderRow={(row) => (
          <TableRow
            key={`${row.link.student_id}-${row.link.parent_id}`}
            className="border-border"
          >
            <TableCell className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-teal-600" />
                </div>
                <span className="font-semibold text-foreground text-sm">
                  {row.studentName}
                </span>
              </div>
            </TableCell>

            <TableCell className="px-4 py-3">
              <div className="font-medium text-foreground text-sm">
                {row.link.class || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {row.link.student_code}
              </div>
            </TableCell>

            <TableCell className="px-4 py-3">
              <span className="font-semibold text-foreground text-sm">
                {row.parentName}
              </span>
            </TableCell>

            <TableCell className="px-4 py-3">
              <Badge
                variant="outline"
                className={row.relationshipBadgeClass}
              >
                {row.relationshipLabel}
              </Badge>
            </TableCell>

            <TableCell className="px-4 py-3 space-y-1">
              <div className="text-sm text-foreground font-medium">{row.phone}</div>
              <div className="text-xs text-muted-foreground">{row.email}</div>
            </TableCell>

            <TableCell className="px-4 py-3 text-right">
              <div className="inline-flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  title="Chỉnh sửa"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(row.link)}
                  disabled={removeMutation.isPending}
                  title="Hủy liên kết"
                >
                  <Link2Off className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )}
      />

      {totalItems > 0 && (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          isBusy={false}
          onPageChange={setCurrentPage}
        />
      )}

      {config && (
        <ConfirmDialog
          open={isOpen}
          title={config.title}
          description={config.description}
          isLoading={isConfirmLoading || removeMutation.isPending}
          onCancel={closeConfirmDialog}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
