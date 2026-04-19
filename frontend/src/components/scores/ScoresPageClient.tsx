'use client';

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useScoreManagement } from '@/components/scores/hooks/useScoreManagement';
import { PaginationBar } from '@/components/shared/PaginationBar';
import type { StudentGroup } from '@/types/score';
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

const PAGE_SIZE = 7;

export function ScoresPageClient() {
  const [draftSearchKeyword, setDraftSearchKeyword] = useState('');
  const [draftSelectedMajor, setDraftSelectedMajor] = useState('');
  const [draftSelectedClass, setDraftSelectedClass] = useState('all');
  const [draftSelectedSubjectId, setDraftSelectedSubjectId] = useState('all');
  const [draftSelectedSemester, setDraftSelectedSemester] = useState('all');
  const [draftSelectedStatus, setDraftSelectedStatus] = useState<'all' | 'PUBLISHED' | 'DRAFT'>('all');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [appliedSelectedMajor, setAppliedSelectedMajor] = useState('');
  const [appliedSelectedClass, setAppliedSelectedClass] = useState('all');
  const [appliedSelectedSubjectId, setAppliedSelectedSubjectId] =
    useState('all');
  const [appliedSelectedSemester, setAppliedSelectedSemester] = useState('all');
  const [appliedSelectedStatus, setAppliedSelectedStatus] = useState<'all' | 'PUBLISHED' | 'DRAFT'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedScoreIds, setSelectedScoreIds] = useState<Set<number>>(new Set());
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishAction, setPublishAction] = useState<'PUBLISH' | 'UNPUBLISH'>('PUBLISH');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLogsSheetOpen, setIsLogsSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUserQuery = useCurrentUser();
  const actorName = currentUserQuery.data?.full_name ?? 'Admin';

  const {
    rows,
    selectedRow,
    setSelectedRowId,
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
    publishSelectedScores,
    publishFilteredScores,
    refetchAll,
  } = useScoreManagement({
    selectedMajor: appliedSelectedMajor,
    selectedClass: appliedSelectedClass,
    searchKeyword: appliedSearchKeyword,
    selectedSubjectId: appliedSelectedSubjectId,
    selectedSemester: appliedSelectedSemester,
    selectedStatus: appliedSelectedStatus,
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
    appliedSelectedStatus,
  ]);

  useEffect(() => {
    if (!canAutoLoad) {
      setAppliedSelectedMajor('');
      setAppliedSearchKeyword('');
      setAppliedSelectedClass('all');
      setAppliedSelectedSubjectId('all');
      setAppliedSelectedSemester('all');
      setAppliedSelectedStatus('all');
      return;
    }

    setAppliedSelectedMajor(draftSelectedMajor);
    setAppliedSearchKeyword(draftSearchKeyword);
    setAppliedSelectedClass(draftSelectedClass);
    setAppliedSelectedSubjectId(draftSelectedSubjectId);
    setAppliedSelectedSemester(draftSelectedSemester);
    setAppliedSelectedStatus(draftSelectedStatus);
    setSelectedScoreIds(new Set());
  }, [
    canAutoLoad,
    draftSearchKeyword,
    draftSelectedClass,
    draftSelectedMajor,
    draftSelectedSemester,
    draftSelectedStatus,
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

  const paginatedGroups = useMemo(() => {
    const groups: Record<number, StudentGroup> = {};
    const result: StudentGroup[] = [];
    for (const row of paginatedRows) {
      if (!groups[row.student_id]) {
        groups[row.student_id] = {
          student_id: row.student_id,
          student_code: row.student_code,
          student_name: row.student_name,
          class_name: row.class_name,
          rows: [],
        };
        result.push(groups[row.student_id]);
      }
      groups[row.student_id].rows.push(row);
    }
    return result;
  }, [paginatedRows]);

  const handleToggleSelect = (scoreId: number) => {
    setSelectedScoreIds((prev) => {
      const next = new Set(prev);
      if (next.has(scoreId)) next.delete(scoreId);
      else next.add(scoreId);
      return next;
    });
  };

  const handleToggleGroup = (scoreIds: number[], isSelected: boolean) => {
    setSelectedScoreIds((prev) => {
      const next = new Set(prev);
      for (const id of scoreIds) {
        if (isSelected) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const handleSaveDetail = (
    rowId: string,
    payload: {
      assignment: number | null;
      midterm: number | null;
      final: number | null;
      note: string;
    },
  ) => {
    void updateStudentDraft(rowId, payload, actorName ?? 'Admin').then(() => {
      toast.success('Đã lưu chỉnh sửa điểm.');
    });
  };

  const handleEditRow = (rowId: string) => {
    setSelectedRowId(rowId);
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

      const importResult = await applyBulkImport(
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

  const selectedRows = useMemo(
    () => rows.filter((r) => r.score_id && selectedScoreIds.has(r.score_id)),
    [rows, selectedScoreIds]
  );

  const canPublish =
    selectedScoreIds.size > 0
      ? selectedRows.some((r) => r.publish_status === 'DRAFT')
      : rows.some((r) => r.publish_status === 'DRAFT');

  const canUnpublish =
    selectedScoreIds.size > 0
      ? selectedRows.some((r) => r.publish_status === 'PUBLISHED')
      : rows.some((r) => r.publish_status === 'PUBLISHED');

  const handlePublishSelected = () => {
    setPublishAction('PUBLISH');
    setIsPublishDialogOpen(true);
  };

  const handleUnpublishSelected = () => {
    setPublishAction('UNPUBLISH');
    setIsPublishDialogOpen(true);
  };

  const confirmPublishAction = () => {
    const actionStr = publishAction === 'PUBLISH' ? 'Công bố' : 'Hủy công bố';
    const status = publishAction === 'PUBLISH' ? 'PUBLISHED' : 'DRAFT';

    if (selectedScoreIds.size > 0) {
      void publishSelectedScores(Array.from(selectedScoreIds), status, actorName ?? 'Admin').then(() => {
        toast.success(`Đã ${actionStr.toLowerCase()} bảng điểm thành công.`);
        setSelectedScoreIds(new Set());
      });
    } else {
      void publishFilteredScores(status, actorName ?? 'Admin').then(() => {
        toast.success(`Đã ${actionStr.toLowerCase()} toàn bộ bảng điểm lớp thành công.`);
      });
    }

    setIsPublishDialogOpen(false);
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
    setAppliedSelectedStatus(draftSelectedStatus);
    setSelectedScoreIds(new Set());
  };

  const handleClearFilters = () => {
    setDraftSelectedMajor('');
    setDraftSearchKeyword('');
    setDraftSelectedClass('all');
    setDraftSelectedSubjectId('all');
    setDraftSelectedSemester('all');
    setDraftSelectedStatus('all');
    setAppliedSelectedMajor('');
    setAppliedSearchKeyword('');
    setAppliedSelectedClass('all');
    setAppliedSelectedSubjectId('all');
    setAppliedSelectedSemester('all');
    setAppliedSelectedStatus('all');
    setSelectedScoreIds(new Set());
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
          selectedCount={selectedScoreIds.size}
          totalCount={rows.length}
          canPublish={canPublish}
          canUnpublish={canUnpublish}
          onPublishSelected={handlePublishSelected}
          onUnpublishSelected={handleUnpublishSelected}
          onImportExcel={handleImportClick}
          onExportExcel={handleExportExcel}
          onExportTemplate={handleExportTemplate}
          onOpenLogs={() => setIsLogsSheetOpen(true)}
        />

        <ScoresFilterBar
          searchKeyword={draftSearchKeyword}
          selectedMajor={draftSelectedMajor}
          selectedClass={draftSelectedClass}
          selectedSubjectId={draftSelectedSubjectId}
          selectedSemester={draftSelectedSemester}
          selectedStatus={draftSelectedStatus}
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
          onStatusChange={setDraftSelectedStatus}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        <ScoresTableCard
          groups={paginatedGroups}
          isLoading={isLoading}
          errorMessage={errorMessage}
          emptyMessage={
            !canAutoLoad
              ? 'Vui lòng chọn chuyên ngành để tải dữ liệu.'
              : 'Không có học sinh phù hợp bộ lọc.'
          }
          selectedScoreIds={selectedScoreIds}
          onToggleSelect={handleToggleSelect}
          onToggleGroup={handleToggleGroup}
          onRetry={() => {
            void refetchAll();
          }}
          onEditRow={handleEditRow}
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
        <SheetContent side="right" className="sm:max-w-xl p-0 flex flex-col gap-0">
          <SheetHeader className="border-b border-border px-6 py-4 shrink-0">
            <SheetTitle>Nhật ký chỉnh sửa điểm</SheetTitle>
            <SheetDescription>
              Theo dõi toàn bộ thao tác nhập, chỉnh sửa và công bố.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <ScoreLogsPanel
              logs={logs}
              maxHeightClassName="h-full"
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
        targetCount={selectedScoreIds.size > 0 ? selectedScoreIds.size : rows.length}
        action={publishAction}
        onCancel={() => setIsPublishDialogOpen(false)}
        onConfirm={confirmPublishAction}
      />
    </>
  );
}
