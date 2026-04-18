'use client';

import { Trash2, Download, Filter, Edit3, Link2Off, User } from 'lucide-react';
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
    CHA: 'CHA',
    ME: 'MẸ',
    NGUOI_GIAM_HO: 'GIÁM HỘ',
  };

const RELATIONSHIP_BADGE_CLASS: Record<
  ParentStudentLinkRow['relationship'],
  string
> = {
  CHA: 'border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wide',
  ME: 'border-pink-200 bg-pink-100 text-pink-700 hover:bg-pink-100 rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wide',
  NGUOI_GIAM_HO:
    'border-purple-200 bg-purple-100 text-purple-700 hover:bg-purple-100 rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wide',
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
    className: 'w-32 px-4',
  },
  {
    key: 'parent',
    label: 'PHỤ HUYNH',
    className: 'px-4',
  },
  {
    key: 'relationship',
    label: 'QUAN HỆ',
    className: 'w-36 px-4',
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
    // CSV export logic
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
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `parent-student-links-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredLinks = filterBy === 'ALL' ? links : links.filter(link => link.relationship === filterBy);

  const totalItems = filteredLinks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
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
      <div className="border-b border-border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold">
            Danh sách các liên kết hiện tại
          </h3>
          <div className="flex items-center gap-3">
            <Select value={filterBy} onValueChange={(value) => {
              setFilterBy(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-40 h-9 bg-white border-slate-200 text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Tất cả quan hệ" />
                </div>
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
              className="gap-2 bg-white"
              onClick={handleExport}
              disabled={links.length === 0}
            >
              <Download className="h-4 w-4" />
              Xuất dữ liệu
            </Button>
          </div>
        </div>
      </div>

      <div>
        <DataTable
          columns={LINK_COLUMNS}
          data={tableRows}
          emptyMessage="Không có liên kết phụ huynh-sinh viên nào."
          renderRow={(row) => (
            <TableRow
              key={`${row.link.student_id}-${row.link.parent_id}`}
              className="border-border hover:bg-slate-50/50"
            >
              <TableCell className="px-4 py-3 font-medium text-slate-900">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <User className="h-4 w-4 text-teal-600" />
                  </div>
                  {row.studentName}
                </div>
              </TableCell>

              <TableCell className="px-4 py-3 text-sm text-slate-600">
                <div className="font-medium text-slate-700">{row.link.class || 'N/A'}</div>
                <div className="text-[11px] text-slate-400">{row.link.student_code}</div>
              </TableCell>

              <TableCell className="px-4 py-3 font-medium text-slate-900">
                {row.parentName}
              </TableCell>

              <TableCell className="px-4 py-3">
                <Badge variant="outline" className={`border-none ${row.relationshipBadgeClass}`}>
                  {row.relationshipLabel}
                </Badge>
              </TableCell>

              <TableCell className="px-4 py-3 space-y-0.5 text-sm">
                <div className="text-slate-700 font-medium">{row.phone}</div>
                <div className="text-slate-500 text-xs">{row.email}</div>
              </TableCell>

              <TableCell className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10"
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
      </div>
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
