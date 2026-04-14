'use client';

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useScoreManagement } from '@/components/scores/hooks/useScoreManagement';
import { PaginationBar } from '@/components/shared/PaginationBar';
import {
  exportScorebookToExcel,
  exportScoreImportTemplate,
  parseScoreImportFile,
} from '@/components/scores/utils/score-excel';
import { ScoresPageHeader } from './ScoresPageHeader';
import { ScoresFilterBar } from './ScoresFilterBar';
import { ScoresTableCard } from './ScoresTableCard';
import { ScoreDetailCard } from './ScoreDetailCard';
import { ScoreLogsPanel } from './ScoreLogsCard';
import { PublishConfirmDialog } from './PublishConfirmDialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const PAGE_SIZE = 10;

export function ScoresPageClient() {
  const [draftSearchKeyword, setDraftSearchKeyword] = useState('');
  const [draftSelectedMajor, setDraftSelectedMajor] = useState('');
  const [draftSelectedClass, setDraftSelectedClass] = useState('all');
  const [draftSelectedSubjectId, setDraftSelectedSubjectId] = useState('all');
  const [draftSelectedSemester, setDraftSelectedSemester] = useState('all');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [appliedSelectedMajor, setAppliedSelectedMajor] = useState('');
  const [appliedSelectedClass, setAppliedSelectedClass] = useState('all');
  const [appliedSelectedSubjectId, setAppliedSelectedSubjectId] =
    useState('all');
  const [appliedSelectedSemester, setAppliedSelectedSemester] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLogsSheetOpen, setIsLogsSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUserQuery = useCurrentUser();
  const actorName = currentUserQuery.data?.full_name ?? 'Admin';

  const {
    rows,
    selectedRow,
    setSelectedStudentId,
    logs,
    majorOptions,
    classOptions,
    subjects,
    isLoading,
    errorMessage,
    publishedCount,
    isFullyPublished,
    updateStudentDraft,
    applyBulkImport,
    setPublishStatusForFilteredRows,
    refetchAll,
  } = useScoreManagement({
    selectedMajor: appliedSelectedMajor,
    selectedClass: appliedSelectedClass,
    searchKeyword: appliedSearchKeyword,
    selectedSubjectId: appliedSelectedSubjectId,
    selectedSemester: appliedSelectedSemester,
  });

  const canAutoLoad = draftSelectedMajor.trim().length > 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [
    appliedSearchKeyword,
    appliedSelectedMajor,
    appliedSelectedClass,
    appliedSelectedSubjectId,
    appliedSelectedSemester,
  ]);

  useEffect(() => {
    if (!canAutoLoad) {
      setAppliedSelectedMajor('');
      setAppliedSearchKeyword('');
      setAppliedSelectedClass('all');
      setAppliedSelectedSubjectId('all');
      setAppliedSelectedSemester('all');
      return;
    }

    setAppliedSelectedMajor(draftSelectedMajor);
    setAppliedSearchKeyword(draftSearchKeyword);
    setAppliedSelectedClass(draftSelectedClass);
    setAppliedSelectedSubjectId(draftSelectedSubjectId);
    setAppliedSelectedSemester(draftSelectedSemester);
  }, [
    canAutoLoad,
    draftSearchKeyword,
    draftSelectedClass,
    draftSelectedMajor,
    draftSelectedSemester,
    draftSelectedSubjectId,
  ]);

  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [currentPage, rows]);

  const handleSaveDetail = (
    studentId: number,
    payload: {
      assignment: number | null;
      midterm: number | null;
      final: number | null;
      note: string;
    },
  ) => {
    updateStudentDraft(studentId, payload, actorName ?? 'Admin');
    toast.success('Đã lưu chỉnh sửa điểm.');
  };

  const handleEditStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setIsEditDialogOpen(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const parseResult = await parseScoreImportFile(file);

      if (parseResult.errors.length > 0) {
        toast.error(parseResult.errors[0]);
      }

      if (parseResult.rows.length === 0) {
        return;
      }

      const importResult = applyBulkImport(
        parseResult.rows,
        actorName ?? 'Admin',
      );

      if (importResult.updatedCount > 0) {
        toast.success(
          `Đã cập nhật ${importResult.updatedCount} học sinh từ Excel.`,
        );
      }

      if (importResult.missingCodes.length > 0) {
        toast.warning(
          `${importResult.missingCodes.length} MSSV không tìm thấy trong danh sách lớp hiện tại.`,
        );
      }
    } catch {
      toast.error('Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng.');
    } finally {
      event.target.value = '';
    }
  };

  const handleExportExcel = () => {
    const classSuffix =
      appliedSelectedClass === 'all' ? 'tat-ca-lop' : appliedSelectedClass;
    const subjectSuffix =
      appliedSelectedSubjectId === 'all'
        ? 'tat-ca-mon'
        : appliedSelectedSubjectId;
    const semesterSuffix =
      appliedSelectedSemester === 'all' ? 'tat-ca-ky' : appliedSelectedSemester;
    const fileName = `bang-diem-${classSuffix}-${subjectSuffix}-${semesterSuffix}.xlsx`;

    exportScorebookToExcel(rows, fileName);
    toast.success('Đã xuất Excel thành công.');
  };

  const handleExportTemplate = () => {
    exportScoreImportTemplate('template-import-diem.xlsx');
    toast.success('Đã tải biểu mẫu nhập điểm.');
  };

  const handleTogglePublish = () => {
    if (rows.length === 0) {
      toast.warning('Không có dữ liệu để công bố.');
      return;
    }

    if (isFullyPublished) {
      setPublishStatusForFilteredRows('DRAFT', actorName ?? 'Admin');
      toast.success('Đã hủy công bố bảng điểm lớp.');
      return;
    }

    setIsPublishDialogOpen(true);
  };

  const confirmPublish = () => {
    setPublishStatusForFilteredRows('PUBLISHED', actorName ?? 'Admin');
    setIsPublishDialogOpen(false);
    toast.success('Đã công bố bảng điểm.');
  };

  const handleApplyFilters = () => {
    if (!canAutoLoad) {
      toast.warning('Vui lòng chọn chuyên ngành trước khi áp dụng.');
      return;
    }

    setAppliedSelectedMajor(draftSelectedMajor);
    setAppliedSearchKeyword(draftSearchKeyword);
    setAppliedSelectedClass(draftSelectedClass);
    setAppliedSelectedSubjectId(draftSelectedSubjectId);
    setAppliedSelectedSemester(draftSelectedSemester);
  };

  const handleClearFilters = () => {
    setDraftSelectedMajor('');
    setDraftSearchKeyword('');
    setDraftSelectedClass('all');
    setDraftSelectedSubjectId('all');
    setDraftSelectedSemester('all');
    setAppliedSelectedMajor('');
    setAppliedSearchKeyword('');
    setAppliedSelectedClass('all');
    setAppliedSelectedSubjectId('all');
    setAppliedSelectedSemester('all');
  };

  const isMajorSelected = draftSelectedMajor.trim().length > 0;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleImportChange}
      />

      <div className="space-y-6">
        <ScoresPageHeader
          isFullyPublished={isFullyPublished}
          publishedCount={publishedCount}
          totalCount={rows.length}
          onImportExcel={handleImportClick}
          onExportExcel={handleExportExcel}
          onExportTemplate={handleExportTemplate}
          onTogglePublish={handleTogglePublish}
          onOpenLogs={() => setIsLogsSheetOpen(true)}
        />

        <ScoresFilterBar
          searchKeyword={draftSearchKeyword}
          selectedMajor={draftSelectedMajor}
          selectedClass={draftSelectedClass}
          selectedSubjectId={draftSelectedSubjectId}
          selectedSemester={draftSelectedSemester}
          majorOptions={majorOptions}
          classOptions={classOptions}
          subjects={subjects}
          isMajorSelected={isMajorSelected}
          canAutoLoad={canAutoLoad}
          onSearchKeywordChange={setDraftSearchKeyword}
          onMajorChange={(value) => {
            setDraftSelectedMajor(value);
            setDraftSelectedClass('all');
          }}
          onClassChange={setDraftSelectedClass}
          onSubjectChange={setDraftSelectedSubjectId}
          onSemesterChange={setDraftSelectedSemester}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        <ScoresTableCard
          rows={paginatedRows}
          isLoading={isLoading}
          errorMessage={errorMessage}
          emptyMessage={
            !canAutoLoad
              ? 'Vui lòng chọn chuyên ngành để tải dữ liệu.'
              : 'Không có học sinh phù hợp bộ lọc.'
          }
          onRetry={() => {
            void refetchAll();
          }}
          onEditStudent={handleEditStudent}
          footer={
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              isBusy={isLoading}
              onPageChange={setCurrentPage}
            />
          }
        />
      </div>

      <Sheet open={isLogsSheetOpen} onOpenChange={setIsLogsSheetOpen}>
        <SheetContent side="right" className="sm:max-w-xl p-0">
          <SheetHeader className="border-b border-border px-6 py-4">
            <SheetTitle>Nhật ký chỉnh sửa điểm</SheetTitle>
            <SheetDescription>
              Theo dõi toàn bộ thao tác nhập, chỉnh sửa và công bố.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6">
            <ScoreLogsPanel
              logs={logs}
              maxHeightClassName="h-[calc(100vh-10.5rem)]"
            />
          </div>
        </SheetContent>
      </Sheet>

      <ScoreDetailCard
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedRow={selectedRow}
        onSave={handleSaveDetail}
      />

      <PublishConfirmDialog
        open={isPublishDialogOpen}
        targetCount={rows.length}
        onCancel={() => setIsPublishDialogOpen(false)}
        onConfirm={confirmPublish}
      />
    </>
  );
}
