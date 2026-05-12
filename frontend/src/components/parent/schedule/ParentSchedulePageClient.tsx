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
  const [selectedSemester, setSelectedSemester] = useState('all');
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

  const { sections: rawSections, isLoading, isError, refetch } = useParentClassSections(undefined);

  const allSections = rawSections.filter((section) => 
    selectedSemester === 'all' || section.semester === selectedSemester
  );

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
        sections={rawSections}
        value={selectedSemester}
        onChange={setSelectedSemester}
      />

      <ParentScheduleStatCards sections={allSections} isLoading={isLoading} />

      <ParentScheduleWeeklyGrid
        sections={allSections}
        loading={isLoading}
        onSectionClick={openDetail}
      />

      <ParentScheduleSectionsTable
        sections={allSections}
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
