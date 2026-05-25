'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useParentClassSections } from '@/hooks/queries/useParentClassSections';
import { useCurrentUser }          from '@/hooks/useCurrentUser';
import { useStudentStore }         from '@/stores/useStudentStore';
import type { ParentProfile }      from '@/types/auth';
import type { StudentClassSection } from '@/services/attendance.service';

import { ParentSchedulePageHeader }         from './ParentSchedulePageHeader';
import { ParentScheduleFilterBar }          from './ParentScheduleFilterBar';
import { ParentScheduleStatCards }          from './ParentScheduleStatCards';
import { ParentScheduleWeeklyGrid }         from './ParentScheduleWeeklyGrid';
import { ParentScheduleSectionsTable }      from './ParentScheduleSectionsTable';
import { ParentScheduleSectionDetailSheet } from './ParentScheduleSectionDetailSheet';

export default function ParentSchedulePageClient() {
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('all');
  const [selectedTermId, setSelectedTermId] = useState('all');
  const [selectedSection, setSelectedSection]   = useState<StudentClassSection | null>(null);
  const [sheetOpen, setSheetOpen]               = useState(false);

  const profileQuery = useCurrentUser();
  const profile      = profileQuery.data as ParentProfile | undefined;
  const students     = profile?.students ?? [];

  const { selectedStudentId } = useStudentStore();
  const activeStudentId =
    selectedStudentId !== null && students.some((s) => s.student_id === selectedStudentId)
      ? selectedStudentId
      : students[0]?.student_id ?? 0;

  const activeStudent =
    students.find((s) => s.student_id === activeStudentId) ?? students[0] ?? null;

  const academicYearId =
    selectedAcademicYearId === 'all'
      ? undefined
      : Number(selectedAcademicYearId);

  const { sections, isLoading, isError, refetch } = useParentClassSections(
    selectedTermId === 'all' ? 'all' : Number(selectedTermId),
    academicYearId,
  );

  function handleAcademicYearChange(value: string) {
    setSelectedAcademicYearId(value);
    setSelectedTermId('all');
  }

  function openDetail(section: StudentClassSection) {
    setSelectedSection(section);
    setSheetOpen(true);
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">Không thể tải dữ liệu thời khóa biểu</p>
          <p className="text-xs text-muted-foreground">Đã có lỗi khi kết nối máy chủ.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4" /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-1 py-2">

      <ParentSchedulePageHeader activeStudent={activeStudent} />

      <ParentScheduleFilterBar
        academicYearValue={selectedAcademicYearId}
        termValue={selectedTermId}
        onAcademicYearChange={handleAcademicYearChange}
        onTermChange={setSelectedTermId}
      />

      <ParentScheduleStatCards sections={sections} isLoading={isLoading} />

      <ParentScheduleWeeklyGrid
        sections={sections}
        loading={isLoading}
        onSectionClick={openDetail}
      />

      <ParentScheduleSectionsTable
        sections={sections}
        loading={isLoading}
        onRowClick={openDetail}
      />

      <ParentScheduleSectionDetailSheet
        section={selectedSection}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

    </div>
  );
}
